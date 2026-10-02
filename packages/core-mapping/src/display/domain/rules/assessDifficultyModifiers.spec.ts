import {describe, expect, it} from 'bun:test';
import {assessDifficultyModifiers, DifficultyModifierEffects} from './assessDifficultyModifiers';

describe('assessDifficultyModifiers', () => {
  describe('When every modifier is at one', () => {
    it('should assess every modifier at the game default', () => {
      // Arrange
      const modifiers = {terraformationPace: 1, powerConsumption: 1, gaugeDrain: 1, meteoOccurrence: 1, multiplayerFactor: 0.5};

      // Act
      const effects = assessDifficultyModifiers(modifiers);

      // Assert
      expect<DifficultyModifierEffects>(effects).toEqual({
        terraformationPace: 'gameDefault',
        powerConsumption: 'gameDefault',
        gaugeDrain: 'gameDefault',
        meteoOccurrence: 'gameDefault',
        multiplayerFactor: 'gameDefault'
      });
    });
  });

  describe('When every modifier is above one', () => {
    it('should assess the terraformation pace as helping and the other modifiers as penalising the player', () => {
      // Arrange
      const modifiers = {terraformationPace: 2, powerConsumption: 1.5, gaugeDrain: 3, meteoOccurrence: 1.01, multiplayerFactor: 1};

      // Act
      const effects = assessDifficultyModifiers(modifiers);

      // Assert
      expect<DifficultyModifierEffects>(effects).toEqual({
        terraformationPace: 'helpsThePlayer',
        powerConsumption: 'penalisesThePlayer',
        gaugeDrain: 'penalisesThePlayer',
        meteoOccurrence: 'penalisesThePlayer',
        multiplayerFactor: 'penalisesThePlayer'
      });
    });
  });

  describe('When every modifier is below one', () => {
    it('should assess the terraformation pace as penalising and the other modifiers as helping the player', () => {
      // Arrange
      const modifiers = {terraformationPace: 0.5, powerConsumption: 0, gaugeDrain: 0, meteoOccurrence: 0.99, multiplayerFactor: 0.2};

      // Act
      const effects = assessDifficultyModifiers(modifiers);

      // Assert
      expect<DifficultyModifierEffects>(effects).toEqual({
        terraformationPace: 'penalisesThePlayer',
        powerConsumption: 'helpsThePlayer',
        gaugeDrain: 'helpsThePlayer',
        meteoOccurrence: 'helpsThePlayer',
        multiplayerFactor: 'helpsThePlayer'
      });
    });
  });
});
