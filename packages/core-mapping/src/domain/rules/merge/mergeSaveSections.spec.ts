import {describe, expect, it} from 'bun:test';
import {mergeSaveSections} from './mergeSaveSections';
import {createPlayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {createDecodedSections} from '../../../testing/createDecodedSections';
import {DecodedInventory} from './DecodedInventory';
import {DecodedWorldObject} from './DecodedWorldObject';

describe('Merge saves', () => {
    const saveDisplayName = 'SAVE_NAME';

    describe('When both saves carry entries in the sections holding identifiers', () => {
        it('should keep the origin of players, inventories and world objects', () => {
            // Arrange
            const playerFromSaveA = createPlayer({host: false, id: '1', name: 'PlayerA', inventoryId: 10, equipmentId: 11});
            const playerFromSaveB = createPlayer({host: false, id: '2', name: 'PlayerB', inventoryId: 20, equipmentId: 21});
            const inventoryFromSaveA: DecodedInventory = {id: 10, woIds: [], size: 20};
            const inventoryFromSaveB: DecodedInventory = {id: 20, woIds: [], size: 20};
            const worldObjectFromSaveA: DecodedWorldObject = {id: 100, gId: 'Container2', pos: '1,0,1'};
            const worldObjectFromSaveB: DecodedWorldObject = {id: 200, gId: 'VegetubeOutside1', pos: '5,0,5'};

            const sectionsA = createDecodedSections({
                players: [playerFromSaveA],
                inventories: [inventoryFromSaveA],
                worldObjects: function* () {
                    yield worldObjectFromSaveA;
                }
            });
            const sectionsB = createDecodedSections({
                players: [playerFromSaveB],
                inventories: [inventoryFromSaveB],
                worldObjects: function* () {
                    yield worldObjectFromSaveB;
                }
            });

            // Act
            const result = mergeSaveSections(sectionsA, sectionsB, saveDisplayName);

            // Assert
            expect(result.players).toEqual({fromSaveA: [playerFromSaveA], fromSaveB: [playerFromSaveB]});
            expect(result.inventories).toEqual({fromSaveA: [inventoryFromSaveA], fromSaveB: [inventoryFromSaveB]});
            expect(result.worldObjects).toEqual({fromSaveA: [worldObjectFromSaveA], fromSaveB: [worldObjectFromSaveB]});
        });
    });
});
