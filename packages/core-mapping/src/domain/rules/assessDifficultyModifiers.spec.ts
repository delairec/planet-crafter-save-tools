import {describe, expect, it} from 'bun:test';
import {assessDifficultyModifiers, DifficultyModifierEffects} from './assessDifficultyModifiers';

describe('assessDifficultyModifiers', () => {
  describe('When every modifier is at one', () => {
    it('should assess every modifier at the game default', () => {
      // Arrange
      const modifiers = {terraformationPace: 1, powerConsumption: 1, gaugeDrain: 1, meteoOccurrence: 1, multiplayerFactor: 1};

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
    it('should assess the percentages as penalising and the coefficients as helping the player', () => {
      // Arrange
      const modifiers = {terraformationPace: 2, powerConsumption: 1.5, gaugeDrain: 3, meteoOccurrence: 1.01, multiplayerFactor: 2};

      // Act
      const effects = assessDifficultyModifiers(modifiers);

      // Assert
      expect<DifficultyModifierEffects>(effects).toEqual({
        terraformationPace: 'penalisesThePlayer',
        powerConsumption: 'penalisesThePlayer',
        gaugeDrain: 'helpsThePlayer',
        meteoOccurrence: 'penalisesThePlayer',
        multiplayerFactor: 'helpsThePlayer'
      });
    });
  });

  describe('When every modifier is below one', () => {
    it('should assess the percentages as helping and the coefficients as penalising the player', () => {
      // Arrange
      const modifiers = {terraformationPace: 0.5, powerConsumption: 0, gaugeDrain: 0, meteoOccurrence: 0.99, multiplayerFactor: 0.5};

      // Act
      const effects = assessDifficultyModifiers(modifiers);

      // Assert
      expect<DifficultyModifierEffects>(effects).toEqual({
        terraformationPace: 'helpsThePlayer',
        powerConsumption: 'helpsThePlayer',
        gaugeDrain: 'penalisesThePlayer',
        meteoOccurrence: 'helpsThePlayer',
        multiplayerFactor: 'penalisesThePlayer'
      });
    });
  });
});
