import {describe, expect, it} from 'bun:test';
import {MergeSourceReaderService} from './MergeSourceReaderService';
import {createFakeSaveContent} from 'shared-save-processing/testing/createFakeSaveContent.js';
import {createFakeSaveString} from 'shared-save-processing/testing/createFakeSaveString.js';
import {stringifyEntry} from 'shared-save-processing/stringifyEntry.js';
import {createEquipment, createInventory, createPlayer, createSaveConfiguration, createWorldObject} from 'shared-save-processing/testing/createSaveRecords.js';
import {SaveParseError} from 'shared-save-processing/gameDefinitions';
import {InventoryEntry} from '../domain/rules/merge/InventoryEntry';
import {WorldObjectEntry} from '../domain/rules/merge/WorldObjectEntry';

describe('MergeSourceReaderService', () => {

  describe('When reading a save whose lines are all readable', () => {
    it('should hand over the inventories with their world object identifiers as numbers', () => {
      // Arrange
      const service = new MergeSourceReaderService();
      const content = createFakeSaveString({
        inventories: [createInventory({id: 10, woIds: '100,101', size: 20}), createEquipment({id: 11, woIds: '', size: 10})]
      });

      // Act
      const {sections} = service.read(content);

      // Assert
      expect<InventoryEntry[]>(sections.inventories).toEqual([
        {id: 10, woIds: [100, 101], size: 20},
        {id: 11, woIds: [], size: 10}
      ]);
    });

    it('should hand over the world objects with their identifier lists as numbers and their absent lists still absent', () => {
      // Arrange
      const service = new MergeSourceReaderService();
      const content = createFakeSaveString({
        worldObjects: [
          createWorldObject({id: 100, gId: 'Farm1', siIds: '10,11', woIds: '200'}),
          createWorldObject({id: 200, gId: 'Container2', liId: 10})
        ]
      });

      // Act
      const {sections} = service.read(content);

      // Assert
      expect<WorldObjectEntry[]>([...sections.worldObjects]).toEqual([
        {id: 100, gId: 'Farm1', siIds: [10, 11], woIds: [200]},
        {id: 200, gId: 'Container2', liId: 10}
      ]);
    });

    it('should hand over the other sections as the save carries them', () => {
      // Arrange
      const service = new MergeSourceReaderService();
      const player = createPlayer({id: '76561190000000001', name: 'Nikowa'});
      const saveConfiguration = createSaveConfiguration({saveDisplayName: 'Save A'});
      const content = createFakeSaveString({players: [player], saveConfiguration});

      // Act
      const {sections, errors} = service.read(content);

      // Assert
      expect(sections.players).toEqual([player]);
      expect(sections.saveConfigurations).toEqual([saveConfiguration]);
      expect<SaveParseError[]>(errors).toEqual([]);
    });
  });

  describe('When a save carries a line that cannot be read', () => {
    it('should report the unreadable line rather than drop it silently', () => {
      // Arrange
      const service = new MergeSourceReaderService();
      const unreadableInventory = createEquipment({id: 45, woIds: '', size: 20});
      const content = createFakeSaveContent({inventories: [unreadableInventory]})
        .replace(JSON.stringify(unreadableInventory), '{not valid json');

      // Act
      const {errors} = service.read(content);

      // Assert
      expect(errors).toEqual([expect.objectContaining({detail: 'Invalid JSON: {not valid json'})]);
    });

    it('should report the unreadable line as soon as the save is read, even when it is a world object', () => {
      // Arrange
      const service = new MergeSourceReaderService();
      const unreadableWorldObject = createWorldObject({id: 79111656, gId: 'Phytoplankton3'});
      const content = createFakeSaveContent()
        .replace(stringifyEntry(unreadableWorldObject), '{not valid json');

      // Act
      const {errors} = service.read(content);

      // Assert
      expect(errors).toEqual([expect.objectContaining({detail: 'Invalid JSON: {not valid json'})]);
    });
  });
});
