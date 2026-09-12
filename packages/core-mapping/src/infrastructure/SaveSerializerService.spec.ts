import {describe, expect, it} from 'bun:test';
import {SaveSerializerService} from './SaveSerializerService';
import {parseSaveSections} from 'shared-save-processing/parseSaveSections.js';
import {INVENTORIES_SECTION_INDEX, PLAYERS_SECTION_INDEX, SAVE_CONFIGURATION_SECTION_INDEX, WORLD_OBJECTS_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {createPlayer, createSaveConfiguration} from 'shared-save-processing/testing/createSaveRecords.js';
import {createSaveSections} from '../testing/createSaveSections';

describe('SaveSerializerService', () => {

  describe('When serializing a save', () => {
    it('should write the identifier lists of inventories and world objects as the save format carries them', () => {
      // Arrange
      const service = new SaveSerializerService();
      const sections = createSaveSections({
        inventories: [{id: 10, woIds: [100, 101], size: 20}, {id: 11, woIds: [], size: 10}],
        worldObjects: [{id: 100, gId: 'Farm1', siIds: [10, 11], woIds: [200]}, {id: 200, gId: 'Container2', liId: 10}]
      });

      // Act
      const content = service.serialize(sections);

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

    it('should write the other sections as the save carries them', () => {
      // Arrange
      const service = new SaveSerializerService();
      const player = createPlayer({id: '76561190000000001', name: 'Nikowa'});
      const saveConfiguration = createSaveConfiguration({saveDisplayName: 'Our merged world'});
      const sections = createSaveSections({players: [player], saveConfigurations: [saveConfiguration]});

      // Act
      const content = service.serialize(sections);

      // Assert
      const {sections: written} = parseSaveSections(content);
      expect(written[PLAYERS_SECTION_INDEX]).toEqual([player]);
      expect(written[SAVE_CONFIGURATION_SECTION_INDEX]).toEqual([saveConfiguration]);
    });
  });
});
