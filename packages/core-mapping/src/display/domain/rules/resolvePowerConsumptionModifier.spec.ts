import {describe, expect, it} from 'bun:test';
import {resolvePowerConsumptionModifier} from './resolvePowerConsumptionModifier';
import {SaveConfigurationValueObject} from '../valueObjects/SaveConfigurationValueObject';

describe('resolvePowerConsumptionModifier', () => {
  describe('When the save carries a configuration', () => {
    it('should take the power consumption modifier of the configuration', () => {
      // Arrange
      const saveConfiguration: SaveConfigurationValueObject = {
        title: 'Standard',
        mode: 'Standard',
        modifiers: {terraformationPace: 1, powerConsumption: 0.5, gaugeDrain: 1, meteoOccurrence: 1, multiplayerFactor: 1},
        unlocks: {
          freeCraft: false,
          everythingUnlocked: false,
          spaceTrading: false,
          oreExtractors: false,
          teleporters: false,
          drones: false,
          autocrafter: false,
          randomizedMineables: false
        }
      };

      // Act
      const modifier = resolvePowerConsumptionModifier(saveConfiguration);

      // Assert
      expect(modifier).toBe(0.5);
    });
  });

  describe('When the save carries no configuration', () => {
    it('should take the game default modifier', () => {
      // Arrange
      const noSaveConfiguration = undefined;

      // Act
      const modifier = resolvePowerConsumptionModifier(noSaveConfiguration);

      // Assert
      expect(modifier).toBe(1);
    });
  });
});
