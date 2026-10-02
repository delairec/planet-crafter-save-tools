export type DroneLogisticsEffectResponse = 'penalisesThePlayer' | 'helpsThePlayer';

export interface DroneLogisticsResponse {
  readonly paused: boolean;
  readonly effect: DroneLogisticsEffectResponse;
}
