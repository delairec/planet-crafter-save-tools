import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from '../testing/createFakeScriptIo.ts';
import {validateTables} from './validate-tables.ts';

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

describe('validateTables', () => {
  const schemaHeader = {$schema: 'http://json-schema.org/draft-07/schema#'};
  const validRows = '[{"numericId": 1, "planetName": "Prime"}]';
  const invalidRows = '[{"numericId": "one", "planetName": "Prime"}]';

  describe('When every table of a data- package meets the schema beside it', () => {
    it('should print nothing and exit with zero', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-planets/planets.json': validRows,
          'packages/data-planets/planets.schema.json': JSON.stringify(planetSchema)
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({printedErrors: [], exitCodes: [0]});
    });
  });

  describe('When a row of a table breaks the schema beside it', () => {
    it('should print the table, the row and the rule it breaks, and exit with one', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-planets/planets.json': invalidRows,
          'packages/data-planets/planets.schema.json': JSON.stringify(planetSchema)
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: [expect.stringContaining('packages/data-planets/planets.json row 0: /0/numericId')],
        exitCodes: [1]
      });
    });
  });

  describe('When a table is not an array of rows', () => {
    it('should print the whole table, with no row index, and exit with one', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-planets/planets.json': '{"numericId": 1, "planetName": "Prime"}',
          'packages/data-planets/planets.schema.json': JSON.stringify(planetSchema)
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: ['packages/data-planets/planets.json row -1: / must be array'],
        exitCodes: [1]
      });
    });
  });

  describe('When a table has no schema of its name beside it', () => {
    it('should name the table and the schema it lacks, and exit with one', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {'packages/data-planets/planets.json': validRows}
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: ['packages/data-planets/planets.json has no schema beside it, packages/data-planets/planets.schema.json'],
        exitCodes: [1]
      });
    });
  });

  describe('When the json files of a package are its manifest, a tsconfig, schemas or files under node_modules', () => {
    it('should take none for a table', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-planets/package.json': '{}',
          'packages/data-planets/tsconfig.json': '{}',
          'packages/data-planets/tsconfig.build.json': '{}',
          'packages/data-planets/planets.schema.json': JSON.stringify(planetSchema),
          'packages/data-planets/node_modules/dependency/data.json': '{}'
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({printedErrors: [], exitCodes: [0]});
    });
  });

  describe('When the schema beside a table reaches a shared schema relative to itself', () => {
    it('should validate the rows of the table against the shared schema', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-planets/byRelease/2.004.json': invalidRows,
          'packages/data-planets/byRelease/2.004.schema.json': JSON.stringify({...schemaHeader, $ref: '../shared.schema.json'}),
          'packages/data-planets/shared.schema.json': JSON.stringify({...schemaHeader, $id: 'shared.schema.json', ...planetSchema})
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: [expect.stringContaining('packages/data-planets/byRelease/2.004.json row 0: /0/numericId')],
        exitCodes: [1]
      });
    });
  });

  describe('When a table names its values by a column of another table', () => {
    const releaseSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {release: {valueOfTable: {table: 'releases.json', column: 'release'}}}
      }
    };
    const releasesTable = '[{"release": "7.777"}]';
    const releasesSchema = '{"type": "array"}';

    it('should accept a value that column holds', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-planets/planets.json': '[{"release": "7.777"}]',
          'packages/data-planets/planets.schema.json': JSON.stringify(releaseSchema),
          'packages/data-planets/releases.json': releasesTable,
          'packages/data-planets/releases.schema.json': releasesSchema
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({printedErrors: [], exitCodes: [0]});
    });

    it('should print the row whose value that column does not hold, and exit with one', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-planets/planets.json': '[{"release": "7.777"}, {"release": "9.999"}]',
          'packages/data-planets/planets.schema.json': JSON.stringify(releaseSchema),
          'packages/data-planets/releases.json': releasesTable,
          'packages/data-planets/releases.schema.json': releasesSchema
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: [expect.stringContaining('packages/data-planets/planets.json row 1: /1/release')],
        exitCodes: [1]
      });
    });
  });

  describe('When a shared schema names a table relative to itself', () => {
    const sharedSchema = {
      type: 'array',
      items: {
        type: 'object',
        properties: {release: {valueOfTable: {table: 'releases.json', column: 'release'}}}
      }
    };

    it('should look the values up in the table beside the shared schema', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-planets/byRelease/2.004.json': '[{"release": "7.777"}, {"release": "9.999"}]',
          'packages/data-planets/byRelease/2.004.schema.json': JSON.stringify({$ref: '../shared.schema.json'}),
          'packages/data-planets/shared.schema.json': JSON.stringify(sharedSchema),
          'packages/data-planets/releases.json': '[{"release": "7.777"}]',
          'packages/data-planets/releases.schema.json': '{"type": "array"}'
        }
      });

      // Act
      await validateTables(io);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: [expect.stringContaining('packages/data-planets/byRelease/2.004.json row 1: /1/release')],
        exitCodes: [1]
      });
    });
  });
});

describe('validateTables when a file is missing', () => {

  describe('When reading a schema that is not there rejects, as reading a missing file does', () => {
    it('should report the table as having no schema beside it', async () => {
      // Arrange
      const {io, printedErrors, exitCodes} = createFakeScriptIo({
        files: {'packages/data-planets/planets.json': '[]'}
      });
      const rejectingIo = {
        ...io,
        readText: async (file: string) => {
          if (file.endsWith('.schema.json')) {
            throw new Error(`ENOENT ${file}`);
          }
          return '[]';
        }
      };

      // Act
      await validateTables(rejectingIo);

      // Assert
      expect({printedErrors, exitCodes}).toEqual({
        printedErrors: ['packages/data-planets/planets.json has no schema beside it, packages/data-planets/planets.schema.json'],
        exitCodes: [1]
      });
    });
  });

  describe('When the schema beside a table reaches a shared schema that is not there', () => {
    it('should fail naming the schema it cannot read', async () => {
      // Arrange
      const {io} = createFakeScriptIo({
        files: {
          'packages/data-planets/planets.json': '[]',
          'packages/data-planets/planets.schema.json': JSON.stringify({$ref: './missing.schema.json'})
        }
      });

      // Act
      const validation = validateTables(io);

      // Assert
      await expect(validation).rejects.toThrow('packages/data-planets/missing.schema.json is not readable');
    });
  });

  describe('When a schema names a table that is not there', () => {
    it('should fail naming the table it cannot read', async () => {
      // Arrange
      const {io} = createFakeScriptIo({
        files: {
          'packages/data-planets/planets.json': '[]',
          'packages/data-planets/planets.schema.json': JSON.stringify({valueOfTable: {table: 'missing.json', column: 'release'}})
        }
      });

      // Act
      const validation = validateTables(io);

      // Assert
      await expect(validation).rejects.toThrow('packages/data-planets/missing.json is not readable');
    });
  });
});
