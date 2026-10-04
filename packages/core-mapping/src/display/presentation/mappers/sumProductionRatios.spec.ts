import {describe, expect, it} from 'bun:test';
import {sumProductionRatios} from './sumProductionRatios';

describe('sumProductionRatios', () => {
  it('should add up the shares of production of the entries', () => {
    // Act
    const share = sumProductionRatios([0.25, 0.5]);

    // Assert
    expect<number | undefined>(share).toBe(0.75);
  });

  describe('When the planet produces nothing', () => {
    it('should name no share', () => {
      // Arrange
      const shareOfAnEntryWithoutProduction = undefined;

      // Act
      const share = sumProductionRatios([shareOfAnEntryWithoutProduction, shareOfAnEntryWithoutProduction]);

      // Assert
      expect<number | undefined>(share).toBeUndefined();
    });
  });

  describe('When there is no entry', () => {
    it('should name no share', () => {
      // Arrange
      const noEntries: number[] = [];

      // Act
      const share = sumProductionRatios(noEntries);

      // Assert
      expect<number | undefined>(share).toBeUndefined();
    });
  });
});
