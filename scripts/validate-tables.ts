import Ajv from 'ajv';
import fs from 'node:fs/promises';

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

export async function validateTables(tableStems: string[]): Promise<number> {
  let exitCode = 0;
  for (const stem of tableStems) {
    const rowsContent = await fs.readFile(`${stem}.json`, 'utf8');
    const schemaContent = await fs.readFile(`${stem}.schema.json`, 'utf8');
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
  process.exit(await validateTables(process.argv.slice(2)));
}
