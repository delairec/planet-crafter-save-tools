import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from '../../common/testing/createFakeScriptIo.ts';
import {checkWireFormat, findWireAbbreviations} from './check-wire-format.ts';

const ABBREVIATION_REASON = 'the domain names the business concept, never the save format abbreviation: translate it at the domain boundary';

describe('findWireAbbreviations', () => {

  describe('When a domain file uses a save format abbreviation in code', () => {
    it.each([
      ['as an identifier', 'const gId = entry.groupId;', 'gId'],
      ['as a destructured identifier', 'const {liId} = entry;', 'liId'],
      ['as a property name', 'return entry.woIds;', 'woIds'],
      ['as a property key of a type', '  siIds: number[];', 'siIds'],
      ['as a property key of an object literal', 'const reference = {linkedWo: 12};', 'linkedWo'],
      ['as a single-quoted string literal key', "const reference = {'gId': 'Iron'};", 'gId'],
      ['as a double-quoted string literal key of a type', '  "liId"?: number;', 'liId'],
      ['as a string literal element access', "return entry['woIds'];", 'woIds'],
      ['inside a template literal expression', 'const label = `object ${entry.gId}`;', 'gId'],
      ['after a division operator', 'const share = total / entry.gId;', 'gId']
    ])('should report it %s', (_usage, source, found) => {
      // Act
      const findings = findWireAbbreviations('packages/core-mapping/src/domain/save/WorldObjectEntry.ts', source);

      // Assert
      expect(findings).toEqual([{line: 1, found, reason: ABBREVIATION_REASON}]);
    });

    it('should report a spec file under domain/ as a production one', () => {
      // Arrange
      const source = 'const worldObject = createWorldObject({liId: 3});';

      // Act
      const findings = findWireAbbreviations('packages/core-mapping/src/domain/rules/merge/mergeWorldObjects.spec.ts', source);

      // Assert
      expect(findings).toEqual([{line: 1, found: 'liId', reason: ABBREVIATION_REASON}]);
    });

    it('should report every occurrence with its line', () => {
      // Arrange
      const source = [
        '/**',
        ' * the group of the object',
        ' */',
        'const inventory = {woIds: entry.woIds};'
      ].join('\n');

      // Act
      const findings = findWireAbbreviations('packages/core-mapping/src/domain/save/InventoryEntry.ts', source);

      // Assert
      expect(findings).toEqual([
        {line: 4, found: 'woIds', reason: ABBREVIATION_REASON},
        {line: 4, found: 'woIds', reason: ABBREVIATION_REASON}
      ]);
    });
  });

  describe('When a domain file names a save format abbreviation outside code', () => {
    it.each([
      ['a line comment', 'const groupId = entry.groupId; // gId in the save'],
      ['a block comment', '/* liId is the inventory of the object */'],
      ['a block comment spanning lines', '/*\n * woIds lists the objects\n */'],
      ['a string literal that is not a key', "it('should translate linkedWo', () => {});"],
      ['a string literal quoting a comment opener', "const label = '// gId';"],
      ['the text of a template literal', 'const label = `the gId of the object`;'],
      ['the text of a template literal left unclosed', 'const label = `the gId of the object'],
      ['a longer identifier', 'const gIdentifier = linkedWorldObject.siIdsCount;']
    ])('should leave %s alone', (_place, source) => {
      // Act
      const findings = findWireAbbreviations('packages/core-mapping/src/domain/save/WorldObjectEntry.ts', source);

      // Assert
      expect(findings).toEqual([]);
    });
  });

  describe('When the file sits outside domain/ of a core- package', () => {
    it.each([
      ['an infrastructure record', 'packages/core-mapping/src/infrastructure/dto/WorldObjectDto.ts'],
      ['the save wire format records', 'packages/core-mapping/src/save/infrastructure/wireFormat/gameDefinitions/WorldObject.ts'],
      ['a domain directory of a ui- package', 'packages/ui-save-manager/src/domain/WorldObjectView.ts'],
      ['an installed dependency', 'packages/core-mapping/node_modules/x/domain/Thing.ts'],
      ['a build output', 'packages/core-mapping/dist/domain/save/WorldObjectEntry.js']
    ])('should leave %s alone', (_file, filePath) => {
      // Arrange
      const source = 'const gId = entry.gId;';

      // Act
      const findings = findWireAbbreviations(filePath, source);

      // Assert
      expect(findings).toEqual([]);
    });
  });
});

describe('checkWireFormat', () => {
  const SUMMARY = 'a domain file names no save format abbreviation (gId, liId, woIds, siIds, linkedWo).';

  describe('When no domain file breaks a refusal', () => {
    it('should print that nothing was found and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-mapping/src/domain/rules/mergeWorldEvents.ts': "import {WorldEventEntity} from '../entities/WorldEventEntity';",
          'packages/core-mapping/src/infrastructure/dto/WorldObjectDto.ts': 'const gId = entry.gId;'
        }
      });

      // Act
      await checkWireFormat(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:wire-format: no domain file names a save format abbreviation.'],
        exitCodes: [0]
      });
    });
  });

  describe('When domain files name save format abbreviations', () => {
    it('should print each offending line with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/core-mapping/src/domain/save/WorldObjectEntry.ts': 'const gId = entry.groupId;',
          'packages/core-mapping/src/domain/save/InventoryEntry.ts': 'const woIds = inventory.woIds;'
        }
      });

      // Act
      await checkWireFormat(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          `packages/core-mapping/src/domain/save/WorldObjectEntry.ts:1: gId\n  ${ABBREVIATION_REASON}`,
          `packages/core-mapping/src/domain/save/InventoryEntry.ts:1: woIds\n  ${ABBREVIATION_REASON}`,
          `packages/core-mapping/src/domain/save/InventoryEntry.ts:1: woIds\n  ${ABBREVIATION_REASON}`,
          `check:wire-format: 3 violation(s): ${SUMMARY}`
        ],
        exitCodes: [1]
      });
    });
  });
});
