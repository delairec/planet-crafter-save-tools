export type DroneLogisticsEffect = 'penalisesThePlayer' | 'helpsThePlayer';

export function assessDroneLogistics(logisticsPaused: boolean): DroneLogisticsEffect {
  if (logisticsPaused) {
    return 'penalisesThePlayer';
  }
  return 'helpsThePlayer';
}
