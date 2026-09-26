import Ajv from 'ajv';
import {readFileSync} from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

const REPOSITORY_ROOT = path.join(import.meta.dir, '..', '..');

interface TableColumn {
  table: string;
  column: string;
}

function readTableColumn({table, column}: TableColumn): unknown[] {
  const rows: Record<string, unknown>[] = JSON.parse(readFileSync(path.join(REPOSITORY_ROOT, table), 'utf8'));
  return rows.map((row) => row[column]);
}

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
  ajv.addKeyword({
    keyword: 'valueOfTable',
    schemaType: 'object',
    validate: (tableColumn: TableColumn, value: unknown) => readTableColumn(tableColumn).includes(value)
  });
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

/** A table is named by its path without `.json`, followed by `:<schema>` when its schema is not named after it. */
export async function validateTables(tables: string[], schemaDirectory: string): Promise<number> {
  let exitCode = 0;
  for (const table of tables) {
    const [stem = table, schemaName = path.basename(stem)] = table.split(':');
    const rowsContent = await fs.readFile(`${stem}.json`, 'utf8');
    const schemaContent = await fs.readFile(path.join(schemaDirectory, `${schemaName}.schema.json`), 'utf8');
    const rows = JSON.parse(rowsContent);
    const schema = JSON.parse(schemaContent);
    const violations = findTableViolations(stem, rows, schema);
    for (const violation of violations) {
      console.error(`${stem}.json row ${violation.row}: ${violation.message}`);
    }
    if (violations.length > 0) {
      exitCode = 1;
    }
  }
  return exitCode;
}

if (import.meta.main) {
  process.exit(await validateTables(process.argv.slice(2), path.join(import.meta.dir, 'schemas')));
}
