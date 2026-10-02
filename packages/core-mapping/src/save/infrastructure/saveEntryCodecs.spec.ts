import {describe, expect, it} from 'bun:test';
import {Inventory, WorldEvent, WorldObject} from './wireFormat/gameDefinitions';
import {createGlobalMetadata, createInventory, createPlayer, createTerraformationLevel, createWorldObject} from './wireFormat/testing/createSaveRecords.js';
import {
  decodeEntry,
  encodeEntry,
  EntryCodec,
  GLOBAL_METADATA_CODEC,
  INVENTORY_CODEC,
  PLAYER_CODEC,
  TERRAFORMATION_LEVEL_CODEC,
  WORLD_EVENT_CODEC,
  WORLD_OBJECT_CODEC
} from './saveEntryCodecs';
import {UnexpectedSaveEntryFieldError} from './errors/UnexpectedSaveEntryFieldError';
import {UnreadableSaveEntryValueError} from './errors/UnreadableSaveEntryValueError';
import {GlobalMetadataEntry} from '../domain/save/GlobalMetadataEntry';
import {InventoryEntry} from '../domain/save/InventoryEntry';
import {PlayerEntry} from '../domain/save/PlayerEntry';
import {TerraformationLevelEntry} from '../domain/save/TerraformationLevelEntry';
import {WorldObjectEntry} from '../domain/save/WorldObjectEntry';

function writeBack<Record extends object, Entry extends object>(record: Record, codec: EntryCodec<Record, Entry>): string {
  return JSON.stringify(encodeEntry(decodeEntry(record, codec), codec));
}

describe('Save entry codecs', () => {
  describe('When a world object is decoded', () => {
    it('should name its fields in business terms, its lists as arrays', () => {
      // Arrange
      const record: WorldObject = {
        id: 100, gId: 'Container2', liId: 10, liGrps: 'Iron,Cobalt', linkedWo: 200, siIds: '10,11', woIds: '200,201',
        pos: '1751.865,-472.58,1106.104', rot: '0,0.5740051,0,-0.8188518', planet: 1
      };

      // Act
      const entry = decodeEntry(record, WORLD_OBJECT_CODEC);

      // Assert
      expect<WorldObjectEntry>(entry).toEqual({
        id: 100, groupId: 'Container2', linkedInventoryId: 10, logisticGroups: ['Iron', 'Cobalt'], linkedWorldObjectId: 200,
        subInventoryIds: [10, 11], heldWorldObjectIds: [200, 201],
        position: '1751.865,-472.58,1106.104', rotation: '0,0.5740051,0,-0.8188518', planet: 1
      });
    });
  });

  describe('When an inventory is decoded', () => {
    it('should hand over its world objects as identifiers and its logistic groups as lists', () => {
      // Arrange
      const record = createInventory({id: 44, woIds: '79111656,58524136', size: 20, demandGrps: 'Iron', supplyGrps: '', priority: 1});

      // Act
      const entry = decodeEntry(record, INVENTORY_CODEC);

      // Assert
      expect<InventoryEntry>(entry).toEqual({
        id: 44, worldObjectIds: [79111656, 58524136], size: 20, demandGroups: ['Iron'], supplyGroups: [], priority: 1
      });
    });

    it('should hand over an empty inventory with no world object', () => {
      // Arrange
      const record = createInventory({id: 44, woIds: '', size: 20});

      // Act
      const entry = decodeEntry(record, INVENTORY_CODEC);

      // Assert
      expect<InventoryEntry>(entry).toEqual({id: 44, worldObjectIds: [], size: 20});
    });
  });

  describe('When the global metadata are decoded', () => {
    it('should hand over the unlocked groups as a list', () => {
      // Arrange
      const record = createGlobalMetadata({unlockedGroups: 'BootsSpeed1,Heater2'});

      // Act
      const entry = decodeEntry(record, GLOBAL_METADATA_CODEC);

      // Assert
      expect<GlobalMetadataEntry>(entry).toEqual({
        terraTokens: 100, allTimeTerraTokens: 200_345, unlockedGroups: ['BootsSpeed1', 'Heater2'], openedInstanceSeed: 0, openedInstanceTimeLeft: 0
      });
    });
  });

  describe('When a player stands on no planet', () => {
    it('should hand over the player without a planet', () => {
      // Arrange
      const record = createPlayer({planetId: ''});

      // Act
      const entry = decodeEntry(record, PLAYER_CODEC);

      // Assert
      expect<PlayerEntry>(entry).toEqual({
        id: '76561190000000001', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
        playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
        playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
        playerGaugeToxic: 0.0, host: true, planetId: undefined,
        cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
      });
    });
  });

  describe('When a planet does not handle purification', () => {
    it('should hand over its terraformation level without a purification level', () => {
      // Arrange
      const record = createTerraformationLevel({planetId: 'Prime', unitPurificationLevel: -1.0});

      // Act
      const entry = decodeEntry(record, TERRAFORMATION_LEVEL_CODEC);

      // Assert
      expect<TerraformationLevelEntry>(entry).toEqual({
        planetId: 'Prime', unitOxygenLevel: 100.0, unitHeatLevel: 200.0, unitPressureLevel: 300.0,
        unitPlantsLevel: 400.0, unitInsectsLevel: 500.0, unitAnimalsLevel: 600.0, unitPurificationLevel: undefined
      });
    });
  });

  describe('When an entry is decoded then encoded back', () => {
    const worldObjectInGameOrder: WorldObject = {
      id: 100, gId: 'Container2', liId: 10, liGrps: '', siIds: '10,11', pos: '1751.865,-472.58,1106.104', rot: '0,0,0,1', planet: 1, count: '3'
    };
    const inventoryWithGroups: Inventory = {id: 44, woIds: '79111656,58524136', size: 20, supplyGrps: 'Iron,Cobalt', demandGrps: ''};
    const legacyPlayerOnNoPlanet = createPlayer({planetId: '', cameraView: undefined, totalCraftedObjects: undefined, totalTerraTokenEarned: undefined});
    const worldEventWithDroppedObjects: WorldEvent = {
      owner: 0, planet: -1140328421, index: 1, seed: 577338550, pos: '1250.623,-51.60085,-215.7026', rot: '-0.001,-0.353,-0.010,-0.935',
      wrecksWOGenerated: true, woIdsGenerated: '201234,205678', woIdsDropped: '201234', version: 13
    };
    const terraformationLevelWithoutPurification = createTerraformationLevel({planetId: 'Prime', unitPurificationLevel: -1.0});

    it('should write back the terraformation level of a planet that does not handle purification, byte for byte', () => {
      // Act
      const text = writeBack(terraformationLevelWithoutPurification, TERRAFORMATION_LEVEL_CODEC);

      // Assert
      expect(text).toBe('{"planetId":"Prime","unitOxygenLevel":100,"unitHeatLevel":200,"unitPressureLevel":300,'
        + '"unitPlantsLevel":400,"unitInsectsLevel":500,"unitAnimalsLevel":600,"unitPurificationLevel":-1}');
    });

    it('should write back a world object in the order of its fields, byte for byte', () => {
      // Act
      const text = writeBack(worldObjectInGameOrder, WORLD_OBJECT_CODEC);

      // Assert
      expect(text).toBe('{"id":100,"gId":"Container2","liId":10,"liGrps":"","siIds":"10,11","pos":"1751.865,-472.58,1106.104","rot":"0,0,0,1","planet":1,"count":"3"}');
    });

    it('should write back an inventory in the order of its fields, byte for byte', () => {
      // Act
      const text = writeBack(inventoryWithGroups, INVENTORY_CODEC);

      // Assert
      expect(text).toBe('{"id":44,"woIds":"79111656,58524136","size":20,"supplyGrps":"Iron,Cobalt","demandGrps":""}');
    });

    it('should write back a legacy player standing on no planet, byte for byte', () => {
      // Act
      const text = writeBack(legacyPlayerOnNoPlanet, PLAYER_CODEC);

      // Assert
      expect(text).toBe('{"id":"76561190000000001","name":"Nikowa","inventoryId":44,"equipmentId":45,'
        + '"playerPosition":"1751.865,472.58,-1106.104","playerRotation":"0,0.5740051,0,-0.8188518",'
        + '"playerGaugeOxygen":280,"playerGaugeThirst":96.3858642578125,"playerGaugeHealth":72.67363739013672,'
        + '"playerGaugeToxic":0,"host":true,"planetId":""}');
    });

    it('should write back a world event in the order of its fields, byte for byte', () => {
      // Act
      const text = writeBack(worldEventWithDroppedObjects, WORLD_EVENT_CODEC);

      // Assert
      expect(text).toBe('{"owner":0,"planet":-1140328421,"index":1,"seed":577338550,"pos":"1250.623,-51.60085,-215.7026",'
        + '"rot":"-0.001,-0.353,-0.010,-0.935","wrecksWOGenerated":true,"woIdsGenerated":"201234,205678","woIdsDropped":"201234","version":13}');
    });
  });

  describe('When a record carries a field its section does not know', () => {
    it('should fail with the error naming the unexpected field', () => {
      // Arrange
      const recordWithForeignField = {...createWorldObject({id: 100, gId: 'Container2'}), foreignField: 3};

      // Act
      const decode = () => decodeEntry(recordWithForeignField, WORLD_OBJECT_CODEC);

      // Assert
      expect(decode).toThrow(UnexpectedSaveEntryFieldError);
    });
  });

  describe('When an entry carries a field the save format cannot write', () => {
    it('should fail with the error naming the unexpected field', () => {
      // Arrange
      const entryWithForeignField = {id: 100, groupId: 'Container2', foreignField: 3};

      // Act
      const encode = () => encodeEntry(entryWithForeignField, WORLD_OBJECT_CODEC);

      // Assert
      expect(encode).toThrow(UnexpectedSaveEntryFieldError);
    });
  });

  describe('When a world object carries a position that cannot be read', () => {
    it.each([
      {situation: 'a coordinate that is not a number', position: '1751.865,north,1106.104'},
      {situation: 'an empty coordinate', position: '1751.865,,1106.104'},
      {situation: 'two coordinates', position: '1751.865,-472.58'},
      {situation: 'four coordinates', position: '1751.865,-472.58,1106.104,0'}
    ])('should fail with the error naming the unreadable value for $situation', ({position}) => {
      // Arrange
      const record = createWorldObject({pos: position, planet: 1});

      // Act
      const decode = () => decodeEntry(record, WORLD_OBJECT_CODEC);

      // Assert
      expect(decode).toThrow(UnreadableSaveEntryValueError);
    });
  });

  describe('When an identifier list holds a value that is not a safe integer', () => {
    it.each([
      {situation: 'a word', worldObjectIds: '79111656,north'},
      {situation: 'a number beyond the safe integers', worldObjectIds: '79111656,9007199254740993'},
      {situation: 'a decimal number', worldObjectIds: '79111656,1.5'}
    ])('should fail with the error naming the unreadable value for $situation', ({worldObjectIds}) => {
      // Arrange
      const record = createInventory({woIds: worldObjectIds});

      // Act
      const decode = () => decodeEntry(record, INVENTORY_CODEC);

      // Assert
      expect(decode).toThrow(UnreadableSaveEntryValueError);
    });
  });
});
