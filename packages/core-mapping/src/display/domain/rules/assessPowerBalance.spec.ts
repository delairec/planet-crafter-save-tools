import {describe, expect, it} from 'bun:test';
import {assessPowerBalance, PowerBalance, PowerFigures} from './assessPowerBalance';

describe('assessPowerBalance', () => {
  describe('When the planet produces power', () => {
    it.each<[string, PowerFigures, PowerBalance]>([
      ['consumes more than it produces', {production: 1_000, consumption: 1_200, available: -200}, 'deficit'],
      ['keeps nothing available', {production: 1_000, consumption: 1_000, available: 0}, 'tight'],
      ['keeps just under a tenth of its production available', {production: 1_000, consumption: 901, available: 99}, 'tight'],
      ['keeps a tenth of its production available', {production: 1_000, consumption: 900, available: 100}, 'surplus'],
      ['keeps most of its production available', {production: 1_000, consumption: 150, available: 850}, 'surplus']
    ])('should assess a planet that %s', (_situation, figures, expectedBalance) => {
      // Act
      const balance = assessPowerBalance(figures);

      // Assert
      expect(balance).toBe(expectedBalance);
    });
  });

  describe('When the planet produces nothing', () => {
    it.each<[string, PowerFigures, PowerBalance]>([
      ['consumes', {production: 0, consumption: 50, available: -50}, 'deficit'],
      ['consumes nothing either', {production: 0, consumption: 0, available: 0}, 'balanced']
    ])('should assess a planet that %s', (_situation, figures, expectedBalance) => {
      // Act
      const balance = assessPowerBalance(figures);

      // Assert
      expect(balance).toBe(expectedBalance);
    });
  });
});
