import {describe, expect, it} from 'bun:test';
import {formatPowerFigures, FormattedPowerFigures, PowerLevels} from "./formatPowerFigures";

const nbsp = ' ';
const minus = '−';

describe('formatPowerFigures', () => {
  it.each<[string, PowerLevels, FormattedPowerFigures]>([
    [
      'a surplus with a plus',
      {production: 1_485, consumption: 187.75, available: 1_297.25},
      {production: `1,485${nbsp}kW`, consumption: `187.75${nbsp}kW`, available: `+1,297.25${nbsp}kW`, shareOfProductionConsumed: '13%'}
    ],
    [
      'a deficit with a minus sign',
      {production: 400, consumption: 500, available: -100},
      {production: `400${nbsp}kW`, consumption: `500${nbsp}kW`, available: `${minus}100${nbsp}kW`, shareOfProductionConsumed: '125%'}
    ],
    [
      'a balance without a sign',
      {production: 500, consumption: 500, available: 0},
      {production: `500${nbsp}kW`, consumption: `500${nbsp}kW`, available: `0${nbsp}kW`, shareOfProductionConsumed: '100%'}
    ]
  ])('should format the power figures in kilowatts, signing the available power of %s', (_availablePowerCase, powerLevels, expectedFigures) => {
    // Act
    const figures = formatPowerFigures(powerLevels);

    // Assert
    expect<FormattedPowerFigures>(figures).toEqual(expectedFigures);
  });

  describe('When the planet produces nothing', () => {
    it('should leave out the share of production consumed', () => {
      // Act
      const figures = formatPowerFigures({production: 0, consumption: 250, available: -250});

      // Assert
      expect<FormattedPowerFigures>(figures).toEqual({production: `0${nbsp}kW`, consumption: `250${nbsp}kW`, available: `${minus}250${nbsp}kW`});
    });
  });
});
