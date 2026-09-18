import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {findTableViolations, TableViolation, validateTables} from './validate-tables.ts';

const planetSchema = {
  type: 'array',
  items: {
    type: 'object',
    required: ['numericId', 'planetName'],
    additionalProperties: false,
    properties: {
      numericId: {type: 'integer'},
      planetName: {type: 'string'}
    }
  }
};

describe('findTableViolations', () => {

  describe('When every row meets the schema', () => {
    it('should report no violation', () => {
      // Arrange
      const rows = [{numericId: 110910045, planetName: 'Toxicity'}];
      const noViolation: TableViolation[] = [];

      // Act
      const violations = findTableViolations('planetNamesByNumericId', rows, planetSchema);

      // Assert
      expect<TableViolation[]>(violations).toEqual(noViolation);
    });
  });

  describe('When a row lacks a required property', () => {
    it('should report the table and the index of that row', () => {
      // Arrange
      const rows = [{numericId: 110910045, planetName: 'Toxicity'}, {numericId: -1140328421}];

      // Act
      const violations = findTableViolations('planetNamesByNumericId', rows, planetSchema);

      // Assert
      expect(violations).toMatchObject([{table: 'planetNamesByNumericId', row: 1}]);
    });
  });

  describe('When the table is not an array of rows', () => {
    it('should report the whole table, with no row index', () => {
      // Arrange
      const rows = {numericId: 110910045, planetName: 'Toxicity'};

      // Act
      const violations = findTableViolations('planetNamesByNumericId', rows, planetSchema);

      // Assert
      expect(violations).toMatchObject([{table: 'planetNamesByNumericId', row: -1}]);
    });
  });
});

describe('validateTables', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await fs.mkdtemp(path.join(os.tmpdir(), 'validate-tables-'));
    await fs.writeFile(path.join(directory, 'planets.schema.json'), JSON.stringify(planetSchema));
  });

  afterEach(async () => {
    await fs.rm(directory, {recursive: true, force: true});
  });

  describe('When every row of the table meets the schema beside it', () => {
    it('should exit with zero', async () => {
      // Arrange
      await fs.writeFile(path.join(directory, 'planets.json'), JSON.stringify([{numericId: 1, planetName: 'Prime'}]));

      // Act
      const exitCode = await validateTables([path.join(directory, 'planets')]);

      // Assert
      expect(exitCode).toBe(0);
    });
  });

  describe('When a row of the table breaks the schema beside it', () => {
    it('should exit with a non-zero code', async () => {
      // Arrange
      await fs.writeFile(path.join(directory, 'planets.json'), JSON.stringify([{numericId: 'one', planetName: 'Prime'}]));

      // Act
      const exitCode = await validateTables([path.join(directory, 'planets')]);

      // Assert
      expect(exitCode).toBe(1);
    });
  });
});
