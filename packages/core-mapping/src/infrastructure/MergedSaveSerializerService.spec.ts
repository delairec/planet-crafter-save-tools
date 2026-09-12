import {describe, expect, it} from 'bun:test';
import {MergedSaveSerializerService} from './MergedSaveSerializerService';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {INVENTORIES_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {createGlobalMetadata, createPlayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {MergedSaveSections} from '../domain/rules/merge/MergedSaveSections';

describe('MergedSaveSerializerService', () => {

  function createMergedSections(overrides: Partial<MergedSaveSections> = {}): MergedSaveSections {
    return {
      globalMetadata: createGlobalMetadata(),
      terraformationLevels: [],
      players: {fromSaveA: [], fromSaveB: []},
      worldObjects: {fromSaveA: [], fromSaveB: []},
      inventories: {fromSaveA: [], fromSaveB: []},
      statistics: undefined,
      mailboxes: [],
      storyEvents: [],
      saveConfiguration: undefined,
      worldEvents: [],
      ...overrides
    };
  }

  describe('When naming the merged file', () => {
    it('should combine both source file names, and hand over the stem the merged save is named after', () => {
      // Arrange
      const service = new MergedSaveSerializerService();

      // Act
      const mergedFileName = service.buildFileName({fileNameA: 'Standard-1.json', fileNameB: 'Standard-2.json'});

      // Assert
      expect(mergedFileName).toEqual({fileName: 'Standard-1-Standard-2-merged.json', stem: 'Standard-1-Standard-2-merged'});
    });
  });

  describe('When serializing the merged sections', () => {
    it('should return the file name it was given', () => {
      // Arrange
      const service = new MergedSaveSerializerService();

      // Act
      const {fileName} = service.serialize({fileName: 'Standard-1-Standard-2-merged.json', sections: createMergedSections()});

      // Assert
      expect(fileName).toBe('Standard-1-Standard-2-merged.json');
    });

    it('should write the entries of save A before those of save B, with their identifier lists as the save format carries them', () => {
      // Arrange
      const service = new MergedSaveSerializerService();
      const sections = createMergedSections({
        players: {fromSaveA: [createPlayer({id: '1', name: 'Nikowa'})], fromSaveB: [createPlayer({id: '2', name: 'Sakia', host: false})]},
        inventories: {fromSaveA: [{id: 10, woIds: [100, 101], size: 20}], fromSaveB: [{id: 11, woIds: [], size: 10}]},
        worldObjects: {
          fromSaveA: [{id: 100, gId: 'Farm1', siIds: [10, 11], woIds: [200]}],
          fromSaveB: [{id: 200, gId: 'Container2', liId: 10}]
        }
      });

      // Act
      const {content} = service.serialize({fileName: 'Standard-1-Standard-2-merged.json', sections});

      // Assert
      const {sections: written} = parseSaveSections(content);
      expect(written[INVENTORIES_SECTION_INDEX]).toEqual([
        {id: 10, woIds: '100,101', size: 20},
        {id: 11, woIds: '', size: 10}
      ]);
      expect([...written[WORLD_OBJECTS_SECTION_INDEX]()]).toEqual([
        {id: 100, gId: 'Farm1', siIds: '10,11', woIds: '200'},
        {id: 200, gId: 'Container2', liId: 10}
      ]);
    });
  });
});
