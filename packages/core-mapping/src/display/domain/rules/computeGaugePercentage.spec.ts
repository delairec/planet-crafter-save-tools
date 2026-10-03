import {describe, expect, it} from 'bun:test';
import {computeGaugePercentage} from './computeGaugePercentage';

describe('computeGaugePercentage', () => {
  it.each([
    {value: 140, maximum: 280, percentage: 50},
    {value: 280, maximum: 280, percentage: 100},
    {value: 0, maximum: 100, percentage: 0}
  ])('should give the share of the maximum the value fills, $value over $maximum', ({value, maximum, percentage}) => {
    // Act
    const gaugePercentage = computeGaugePercentage({value, maximum});

    // Assert
    expect(gaugePercentage).toBe(percentage);
  });

  describe('When the value exceeds its maximum', () => {
    it('should give a full gauge', () => {
      // Act
      const gaugePercentage = computeGaugePercentage({value: 450, maximum: 280});

      // Assert
      expect(gaugePercentage).toBe(100);
    });
  });

  describe('When the value is below zero', () => {
    it('should give an empty gauge', () => {
      // Act
      const gaugePercentage = computeGaugePercentage({value: -5, maximum: 100});

      // Assert
      expect(gaugePercentage).toBe(0);
    });
  });
});
