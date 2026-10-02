import Ajv from 'ajv';
import path from 'node:path';
import {runAsEntryPoint, type ScriptIo} from '../../common/scriptIo.ts';

interface TableViolation {
  row: number;
  message: string;
}

function parseRowIndex(instancePath: string): number {
  const match = instancePath.match(/^\/(\d+)/);
  if (match) {
    return Number(match[1]);
  }
  return -1;
}

function findTableViolations(rows: unknown, schema: object): TableViolation[] {
  const ajv = new Ajv({allErrors: true});
  const validate = ajv.compile(schema);
  const valid = validate(rows);
  if (valid) {
    return [];
  }
  const errors = validate.errors ?? [];
  return errors.map((error) => ({
    row: parseRowIndex(error.instancePath),
    message: `${error.instancePath || '/'} ${error.message}`
  }));
}

const TABLES_PATTERN = 'packages/data-*/**/*.json';

const SCHEMA_SUFFIX = '.schema.json';

function isTable(file: string): boolean {
  const name = path.basename(file);
  return !file.includes('node_modules/') && name !== 'package.json' && !name.startsWith('tsconfig') && !name.endsWith(SCHEMA_SUFFIX);
}

async function readTextIfPresent(io: ScriptIo, file: string): Promise<string | undefined> {
  try {
    return await io.readText(file);
  } catch {
    return undefined;
  }
}

function isPlainObject(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null && !Array.isArray(node);
}

async function readJson(io: ScriptIo, file: string): Promise<unknown> {
  const content = await readTextIfPresent(io, file);
  if (content === undefined) {
    throw new Error(`${file} is not readable`);
  }
  return JSON.parse(content);
}

async function readTableColumn(io: ScriptIo, table: string, column: string): Promise<unknown[]> {
  const rows = (await readJson(io, table)) as Record<string, unknown>[];
  return rows.map((row) => row[column]);
}

async function readSchema(io: ScriptIo, schemaFile: string, isReferenced: boolean): Promise<unknown> {
  const directory = path.dirname(schemaFile);

  async function resolve(node: unknown): Promise<unknown> {
    if (Array.isArray(node)) {
      return Promise.all(node.map(resolve));
    }
    if (!isPlainObject(node)) {
      return node;
    }
    const reference = node['$ref'];
    if (typeof reference === 'string' && reference.startsWith('.')) {
      return readSchema(io, path.join(directory, reference), true);
    }
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      resolved[key] = await resolve(value);
    }
    const {valueOfTable, ...constraints} = resolved;
    if (isPlainObject(valueOfTable) && typeof valueOfTable['table'] === 'string' && typeof valueOfTable['column'] === 'string') {
      return {...constraints, enum: await readTableColumn(io, path.join(directory, valueOfTable['table']), valueOfTable['column'])};
    }
    return resolved;
  }

  const schema = await resolve(await readJson(io, schemaFile));
  if (isReferenced && isPlainObject(schema)) {
    const {$id: _id, $schema: _schema, ...embedded} = schema;
    return embedded;
  }
  return schema;
}

export async function validateTables(io: ScriptIo): Promise<void> {
  let exitCode = 0;
  const tables: string[] = [];
  for await (const file of io.scanFiles(TABLES_PATTERN)) {
    if (isTable(file)) {
      tables.push(file);
    }
  }
  for (const table of tables.toSorted()) {
    const stem = table.slice(0, -'.json'.length);
    const schemaFile = `${stem}${SCHEMA_SUFFIX}`;
    if ((await readTextIfPresent(io, schemaFile)) === undefined) {
      io.printError(`${table} has no schema beside it, ${schemaFile}`);
      exitCode = 1;
      continue;
    }
    const rows = JSON.parse(await io.readText(table));
    const schema = await readSchema(io, schemaFile, false);
    const violations = findTableViolations(rows, schema as object);
    for (const violation of violations) {
      io.printError(`${table} row ${violation.row}: ${violation.message}`);
    }
    if (violations.length > 0) {
      exitCode = 1;
    }
  }
  io.exit(exitCode);
}

await runAsEntryPoint(import.meta.main, validateTables);
