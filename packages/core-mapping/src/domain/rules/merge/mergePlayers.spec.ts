import {describe, expect, it} from 'bun:test';
import {Player} from 'shared-save-processing/gameDefinitions';
import {mergePlayers} from './mergePlayers';
import {createPlayer} from 'shared-save-processing/testing/createSaveRecords.js';
import {EntriesByOrigin} from './EntriesByOrigin';

describe('Merge players', () => {
  describe('When players are unique', () => {
    it('should keep the players of each save under their own origin', () => {
      // Arrange
      const playerFromSaveA = createPlayer();
      const playerFromSaveB = createPlayer({id: '76561190000000030', name: 'Chileny', host: false});

      // Act
      const result = mergePlayers([playerFromSaveA], [playerFromSaveB]);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [{
          id: '76561190000000001', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }],
        fromSaveB: [{
          id: '76561190000000030', name: 'Chileny', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: false, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }]
      });
    });
  });

  describe('When the same player appears in both saves with a different id', () => {
    it('should deduplicate by name and take the player from save A', () => {
      // Arrange
      const playerInSaveA = createPlayer({id: '76561190000000002', playerGaugeOxygen: 150.0});
      const playerInSaveB = createPlayer({id: '76561190000000003', playerGaugeOxygen: 280.0});

      // Act
      const result = mergePlayers([playerInSaveA], [playerInSaveB]);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [{
          id: '76561190000000002', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 150.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }],
        fromSaveB: []
      });
    });
  });

  describe('When a player appears in both saves with the same id', () => {
    it('should take the player from save A', () => {
      // Arrange
      const playerInSaveA = createPlayer({playerGaugeOxygen: 150.0});
      const playerInSaveB = createPlayer({playerGaugeOxygen: 280.0, inventoryId: 99, equipmentId: 99});

      // Act
      const result = mergePlayers([playerInSaveA], [playerInSaveB]);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [{
          id: '76561190000000001', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 150.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }],
        fromSaveB: []
      });
    });
  });

  describe('When merging host status', () => {
    it('should keep save A host status and set all others to false', () => {
      // Arrange
      const hostInSaveA = createPlayer({host: true});
      const guestInSaveA = createPlayer({id: '76561190000000030', name: 'Chileny', host: false});
      const hostInSaveB = createPlayer({id: '76561190000000030', name: 'Anya', host: true});

      // Act
      const result = mergePlayers([hostInSaveA, guestInSaveA], [hostInSaveB]);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [{
          id: '76561190000000001', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }, {
          id: '76561190000000030', name: 'Chileny', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: false, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }],
        fromSaveB: [{
          id: '76561190000000030', name: 'Anya', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: false, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }]
      });
    });
  });

  describe('When a save B player carries the save A host identifier', () => {
    it('should mark only the save A host', () => {
      // Arrange
      const steamIdentifierSharedByBothPlayers = '76561190000000030';
      const hostInSaveA = createPlayer({id: steamIdentifierSharedByBothPlayers, host: true});
      const hostInSaveB = createPlayer({id: steamIdentifierSharedByBothPlayers, name: 'Anya', host: true});

      // Act
      const result = mergePlayers([hostInSaveA], [hostInSaveB]);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [{
          id: '76561190000000030', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }],
        fromSaveB: [{
          id: '76561190000000030', name: 'Anya', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: false, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }]
      });
    });
  });

  describe('When two save A players share an identifier', () => {
    it('should mark only the player flagged as host in save A', () => {
      // Arrange
      const steamIdentifierSharedByBothPlayers = '76561190000000007';
      const hostInSaveA = createPlayer({id: steamIdentifierSharedByBothPlayers, host: true});
      const guestInSaveA = createPlayer({id: steamIdentifierSharedByBothPlayers, name: 'Chileny', host: false});
      const noPlayersFromSaveB: never[] = [];

      // Act
      const result = mergePlayers([hostInSaveA, guestInSaveA], noPlayersFromSaveB);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [{
          id: '76561190000000007', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }, {
          id: '76561190000000007', name: 'Chileny', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: false, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }],
        fromSaveB: []
      });
    });
  });

  describe('When save A holds no player entry', () => {
    it('should keep the save B host', () => {
      // Arrange
      const noPlayersFromSaveA: never[] = [];
      const hostInSaveB = createPlayer({id: '76561190000000030', name: 'Anya', host: true});

      // Act
      const result = mergePlayers(noPlayersFromSaveA, [hostInSaveB]);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [],
        fromSaveB: [{
          id: '76561190000000030', name: 'Anya', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }]
      });
    });
  });

  describe('When merging planetId', () => {
    it('should preserve each player own planetId', () => {
      // Arrange
      const hostInSaveA = createPlayer({host: true, planetId: 'Toxicity'});
      const playerInSaveB = createPlayer({id: '76561190000000030', name: 'Chileny', host: false, planetId: 'Prime'});

      // Act
      const result = mergePlayers([hostInSaveA], [playerInSaveB]);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [{
          id: '76561190000000001', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }],
        fromSaveB: [{
          id: '76561190000000030', name: 'Chileny', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: false, planetId: 'Prime',
          cameraView: 0, totalCraftedObjects: 1820, totalTerraTokenEarned: 9000
        }]
      });
    });
  });

  describe('When a player is missing cameraView, totalCraftedObjects or totalTerraTokenEarned', () => {
    it('should default the missing fields to 0', () => {
      // Arrange
      const {
        cameraView: _cameraView,
        totalCraftedObjects: _totalCraftedObjects,
        totalTerraTokenEarned: _totalTerraTokenEarned,
        ...legacyPlayer
      } = createPlayer();
      const noPlayersFromSaveB: never[] = [];

      // Act
      const result = mergePlayers([legacyPlayer], noPlayersFromSaveB);

      // Assert
      expect<EntriesByOrigin<Player>>(result).toEqual({
        fromSaveA: [{
          id: '76561190000000001', name: 'Nikowa', inventoryId: 44, equipmentId: 45,
          playerPosition: '1751.865,472.58,-1106.104', playerRotation: '0,0.5740051,0,-0.8188518',
          playerGaugeOxygen: 280.0, playerGaugeThirst: 96.3858642578125, playerGaugeHealth: 72.67363739013672,
          playerGaugeToxic: 0.0, host: true, planetId: 'Toxicity',
          cameraView: 0, totalCraftedObjects: 0, totalTerraTokenEarned: 0
        }],
        fromSaveB: []
      });
    });
  });
});
