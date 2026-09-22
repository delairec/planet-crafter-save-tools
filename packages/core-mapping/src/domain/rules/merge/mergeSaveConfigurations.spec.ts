import {describe, it, expect} from 'bun:test';
import {SaveConfiguration} from 'shared-save-processing/gameDefinitions';
import {mergeSaveConfigurations} from './mergeSaveConfigurations';
import {createSaveConfiguration} from 'shared-save-processing/testing/createSaveRecords.js';

describe('Merge save configurations', () => {
  const saveDisplayName = 'SAVE_NAME';

  describe('When both saves have a configuration', () => {
    it('should use the saveDisplayName parameter and take save configuration from save A', () => {
      // Arrange
      const saveConfigurationsA = [createSaveConfiguration({saveDisplayName: 'SAVE_A', planetId: 'Prime'})];
      const saveConfigurationsB = [createSaveConfiguration({
        saveDisplayName: 'SAVE_B', version: '1.1', worldSeed: 7, freeCraft: true, startLocationLabel: 'Crashed Ship'
      })];

      // Act
      const result = mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName);

      // Assert
      expect<SaveConfiguration | undefined>(result).toEqual({
        saveDisplayName: 'SAVE_NAME', planetId: 'Prime', version: '2.004', mode: 'Standard', worldSeed: 42, modded: false,
        modifierTerraformationPace: 0.1, modifierPowerConsumption: 0.2, modifierGaugeDrain: 0.3,
        modifierMeteoOccurence: 0.4, modifierMultiplayerTerraformationFactor: 0.5,
        unlockedSpaceTrading: false, unlockedOreExtrators: false, unlockedTeleporters: false, unlockedDrones: false,
        unlockedAutocrafter: false, unlockedEverything: false, freeCraft: false, preInterplanetarySave: false,
        randomizeMineables: false, dyingConsequencesLabel: 'DropSomeItems', startLocationLabel: 'Standard',
        hasPlayedIntro: true, gameStartLocation: 'Standard'
      });
    });
  });

  describe('When save A has no configuration', () => {
    it('should fall back to save B configuration', () => {
      // Arrange
      const noSaveConfigurationInSaveA: SaveConfiguration[] = [];
      const saveConfigurationsB = [createSaveConfiguration({saveDisplayName: 'SAVE_B', planetId: 'Aqualis', worldSeed: 7})];

      // Act
      const result = mergeSaveConfigurations(noSaveConfigurationInSaveA, saveConfigurationsB, saveDisplayName);

      // Assert
      expect<SaveConfiguration | undefined>(result).toEqual({
        saveDisplayName: 'SAVE_NAME', planetId: 'Aqualis', version: '2.004', mode: 'Standard', worldSeed: 7, modded: false,
        modifierTerraformationPace: 0.1, modifierPowerConsumption: 0.2, modifierGaugeDrain: 0.3,
        modifierMeteoOccurence: 0.4, modifierMultiplayerTerraformationFactor: 0.5,
        unlockedSpaceTrading: false, unlockedOreExtrators: false, unlockedTeleporters: false, unlockedDrones: false,
        unlockedAutocrafter: false, unlockedEverything: false, freeCraft: false, preInterplanetarySave: false,
        randomizeMineables: false, dyingConsequencesLabel: 'DropSomeItems', startLocationLabel: 'Standard',
        hasPlayedIntro: true, gameStartLocation: 'Standard'
      });
    });
  });

  describe('When both saves have no configuration', () => {
    it('should report no configuration at all', () => {
      // Arrange
      const noSaveConfigurationInSaveA: SaveConfiguration[] = [];
      const noSaveConfigurationInSaveB: SaveConfiguration[] = [];

      // Act
      const result = mergeSaveConfigurations(noSaveConfigurationInSaveA, noSaveConfigurationInSaveB, saveDisplayName);

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
