import {describe, expect, it} from 'bun:test';
import {isPowerConsumptionModified} from './isPowerConsumptionModified';

describe('isPowerConsumptionModified', () => {
  describe('When the modifier is the game default', () => {
    it('should find the power consumption unmodified', () => {
      // Arrange
      const gameDefaultModifier = 1;

      // Act
      const modified = isPowerConsumptionModified(gameDefaultModifier);

      // Assert
      expect(modified).toBe(false);
    });
  });

  describe('When the modifier departs from the game default', () => {
    it.each([0, 0.5, 1.5])('should find the power consumption modified at %d', (modifier) => {
      // Act
      const modified = isPowerConsumptionModified(modifier);

      // Assert
      expect(modified).toBe(true);
    });
  });
});
