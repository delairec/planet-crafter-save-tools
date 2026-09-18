import {describe, expect, it} from 'bun:test';
import {WorldObjectName, worldObjectNamesByEnergyRole} from '../domain/worldObjectNames';
import {worldObjectLabels} from './worldObjectLabels';

const knownWorldObjectNames: readonly string[] = [
  ...worldObjectNamesByEnergyRole.producing,
  ...worldObjectNamesByEnergyRole.consuming,
  ...worldObjectNamesByEnergyRole.withoutKnownEnergyLevel
];

describe('worldObjectLabels', () => {

  describe('When every known world object name is looked up', () => {
    it('should find a label for each of them', () => {
      // Arrange
      const noUnlabelledName: string[] = [];

      // Act
      const unlabelledNames = knownWorldObjectNames.filter((name) => worldObjectLabels[name as WorldObjectName] === undefined);

      // Assert
      expect(unlabelledNames).toEqual(noUnlabelledName);
    });
  });

  describe('When the labelled names are compared with the known world object names', () => {
    it('should label no name the game is not known to use', () => {
      // Arrange
      const noUnknownName: string[] = [];

      // Act
      const unknownNames = Object.keys(worldObjectLabels).filter((name) => !knownWorldObjectNames.includes(name));

      // Assert
      expect(unknownNames).toEqual(noUnknownName);
    });
  });
});
