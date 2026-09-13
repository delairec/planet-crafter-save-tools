import {describe, expect, it} from 'bun:test';
import {createPlayerSummaryValueObject} from './PlayerSummaryValueObject';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';

describe('PlayerSummaryValueObject', () => {
  it('should build a player summary value object from valid data', () => {
    // Arrange
    const input = {name: 'Nikowa', inventory: ['Backpack4'], equipment: ['OxygenTank5']};

    // Act
    const playerSummary = createPlayerSummaryValueObject(input);

    // Assert
    expect(playerSummary).toEqual(input);
  });

  it('should reject an empty name', () => {
    // Arrange
    const input = {name: '', inventory: [], equipment: []};

    // Act & Assert
    expect(() => createPlayerSummaryValueObject(input)).toThrow(InvalidSaveDataError);
  });

  it('should reject a belonging that is not a name', () => {
    // Arrange
    const input = {name: 'Nikowa', inventory: [''], equipment: []};

    // Act & Assert
    expect(() => createPlayerSummaryValueObject(input)).toThrow(InvalidSaveDataError);
  });
});
