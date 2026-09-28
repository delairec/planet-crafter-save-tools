import {describe, expect, it} from 'bun:test';
import {createSaveConfigurationValueObject} from './SaveConfigurationValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('SaveConfigurationValueObject', () => {
  it('should build a save configuration value object from valid data', () => {
    // Arrange
    const input = {
      title: 'Merged Save',
      mode: 'Standard',
      modifiers: {
        terraformationPace: 0.1,
        powerConsumption: 0.2,
        gaugeDrain: 0.3,
        meteoOccurrence: 0.4,
        multiplayerFactor: 0.5
      },
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
    const saveConfiguration = createSaveConfigurationValueObject(input);

    // Assert
    expect(saveConfiguration).toEqual(input);
  });

  it('should reject a non-finite modifier', () => {
    // Arrange
    const input = {
      title: 'Merged Save',
      mode: 'Standard',
      modifiers: {
        terraformationPace: NaN,
        powerConsumption: 0.2,
        gaugeDrain: 0.3,
        meteoOccurrence: 0.4,
        multiplayerFactor: 0.5
      },
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
    const buildSaveConfiguration = () => createSaveConfigurationValueObject(input);

    // Assert
    expect(buildSaveConfiguration).toThrow(InvalidSaveDataError);
  });

  it('should reject an unlock flag that is not a boolean', () => {
    // Arrange
    const notABoolean: unknown = 'yes';
    const input = {
      title: 'Merged Save',
      mode: 'Standard',
      modifiers: {
        terraformationPace: 0.1,
        powerConsumption: 0.2,
        gaugeDrain: 0.3,
        meteoOccurrence: 0.4,
        multiplayerFactor: 0.5
      },
      unlocks: {
        freeCraft: notABoolean as boolean,
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
    const buildSaveConfiguration = () => createSaveConfigurationValueObject(input);

    // Assert
    expect(buildSaveConfiguration).toThrow(InvalidSaveDataError);
  });
});
