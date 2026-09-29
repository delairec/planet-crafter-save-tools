import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from '../testing/createFakeScriptIo.ts';
import {findTableViolations, TABLE_SCHEMAS_DIRECTORY, TableViolation, validateTables} from './validate-tables.ts';

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

  describe('When a property names its values by a column of another table', () => {
    const releaseSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          release: {valueOfTable: {table: 'packages/data-save-format/gameReleases.json', column: 'release'}}
        }
      }
    };

    it('should report no violation for a value that column holds', () => {
      // Arrange
      const rows = [{release: '1.618'}];
      const noViolation: TableViolation[] = [];

      // Act
      const violations = findTableViolations('releases', rows, releaseSchema);

      // Assert
      expect<TableViolation[]>(violations).toEqual(noViolation);
    });

    it('should report the row whose value that column does not hold', () => {
      // Arrange
      const rows = [{release: '1.618'}, {release: '9.999'}];

      // Act
      const violations = findTableViolations('releases', rows, releaseSchema);

      // Assert
      expect(violations).toMatchObject([{table: 'releases', row: 1}]);
    });
  });
});

describe('validateTables', () => {

  describe('When every row of the table meets the schema of its name in the schema directory', () => {
    it('should print nothing and exit with zero', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        commandLineArguments: ['src/domain/planets'],
        files: {
          'src/domain/planets.json': '[{"numericId": 1, "planetName": "Prime"}]',
          [`${TABLE_SCHEMAS_DIRECTORY}/planets.schema.json`]: JSON.stringify(planetSchema)
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({printedErrors: [], exitCodes: [0]});
    });
  });

  describe('When a row of the table breaks the schema of its name in the schema directory', () => {
    it('should print the table, the row and the rule it breaks, and exit with one', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        commandLineArguments: ['src/domain/planets'],
        files: {
          'src/domain/planets.json': '[{"numericId": "one", "planetName": "Prime"}]',
          [`${TABLE_SCHEMAS_DIRECTORY}/planets.schema.json`]: JSON.stringify(planetSchema)
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: [expect.stringContaining('src/domain/planets.json row 0: /0/numericId')],
        exitCodes: [1]
      });
    });
  });

  describe('When the table is followed by the name of a schema of another name', () => {
    it('should validate its rows against that schema', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        commandLineArguments: ['src/domain/2.004:planets'],
        files: {
          'src/domain/2.004.json': '[{"numericId": "one", "planetName": "Prime"}]',
          [`${TABLE_SCHEMAS_DIRECTORY}/planets.schema.json`]: JSON.stringify(planetSchema)
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: [expect.stringContaining('src/domain/2.004.json row 0: /0/numericId')],
        exitCodes: [1]
      });
    });
  });
});
