import Ajv from 'ajv';
import path from 'node:path';
import {runAsEntryPoint, type ScriptIo} from '../scriptIo.ts';

export const TABLE_SCHEMAS_DIRECTORY = path.join(import.meta.dir, 'schemas');

export interface TableViolation {
  table: string;
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

export function findTableViolations(table: string, rows: unknown, schema: object): TableViolation[] {
  const ajv = new Ajv({allErrors: true});
  const validate = ajv.compile(schema);
  const valid = validate(rows);
  if (valid) {
    return [];
  }
  const errors = validate.errors ?? [];
  return errors.map((error) => ({
    table,
    row: parseRowIndex(error.instancePath),
    message: `${error.instancePath || '/'} ${error.message}`
  }));
}

export async function validateTables(io: ScriptIo): Promise<void> {
  let exitCode = 0;
  for (const stem of io.commandLineArguments) {
    const rowsContent = await io.readText(`${stem}.json`);
    const schemaContent = await io.readText(path.join(TABLE_SCHEMAS_DIRECTORY, `${path.basename(stem)}.schema.json`));
    const rows = JSON.parse(rowsContent);
    const schema = JSON.parse(schemaContent);
    const violations = findTableViolations(stem, rows, schema);
    for (const violation of violations) {
      io.printError(`${stem}.json row ${violation.row}: ${violation.message}`);
    }
    if (violations.length > 0) {
      exitCode = 1;
    }
  }
  io.exit(exitCode);
}

await runAsEntryPoint(import.meta.main, validateTables);
