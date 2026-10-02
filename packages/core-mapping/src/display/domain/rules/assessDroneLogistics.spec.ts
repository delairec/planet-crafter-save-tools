import {describe, expect, it} from 'bun:test';
import {assessDroneLogistics, DroneLogisticsEffect} from './assessDroneLogistics';

describe('assessDroneLogistics', () => {
  it.each<{state: string; logisticsPaused: boolean; expectedEffect: DroneLogisticsEffect}>([
    {state: 'paused', logisticsPaused: true, expectedEffect: 'penalisesThePlayer'},
    {state: 'running', logisticsPaused: false, expectedEffect: 'helpsThePlayer'}
  ])('should assess the $state drone logistics as $expectedEffect', ({logisticsPaused, expectedEffect}) => {
    // Act
    const effect = assessDroneLogistics(logisticsPaused);

    // Assert
    expect<DroneLogisticsEffect>(effect).toBe(expectedEffect);
  });
});
