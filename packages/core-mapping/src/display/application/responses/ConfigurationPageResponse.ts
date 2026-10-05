import type {DroneLogisticsResponse} from "./DroneLogisticsResponse";

export interface GlobalProgressionResponse {
  readonly allTimeTerraTokens: number;
  readonly droneLogistics?: DroneLogisticsResponse;
}

export interface StatisticsResponse {
  readonly totalCraftedObjects: number;
}

export interface DifficultyModifiersResponse {
  readonly terraformationPace: number;
  readonly powerConsumption: number;
  readonly gaugeDrain: number;
  readonly meteoOccurrence: number;
  readonly multiplayerFactor: number;
}

export type DifficultyModifierEffectResponse = 'gameDefault' | 'penalisesThePlayer' | 'helpsThePlayer';

export type DifficultyModifierEffectsResponse = Readonly<Record<keyof DifficultyModifiersResponse, DifficultyModifierEffectResponse>>;

export interface UnlocksResponse {
  readonly freeCraft: boolean;
  readonly everythingUnlocked: boolean;
  readonly spaceTrading: boolean;
  readonly oreExtractors: boolean;
  readonly teleporters: boolean;
  readonly drones: boolean;
  readonly autocrafter: boolean;
  readonly randomizedMineables: boolean;
}

export interface AssessedSaveConfigurationResponse {
  readonly modifiers: DifficultyModifiersResponse;
  readonly modifierEffects: DifficultyModifierEffectsResponse;
  readonly unlocks: UnlocksResponse;
}

export interface ConfigurationPageResponse {
  readonly globalProgression: GlobalProgressionResponse;
  readonly statistics?: StatisticsResponse;
  readonly assessedSaveConfiguration?: AssessedSaveConfigurationResponse;
}
