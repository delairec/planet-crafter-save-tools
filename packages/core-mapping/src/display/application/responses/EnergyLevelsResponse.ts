import {WorldObjectLabelsResponse} from "./WorldObjectLabelsResponse";
import {EnergySettingsResponse} from "./EnergySettingsResponse";

export interface EnergyBreakdownEntryResponse {
  readonly name: string;
  readonly quantity: number;
  readonly unitLevel: number;
  readonly totalLevel: number;
  readonly productionRatio?: number;
}

export interface OptimizerBoostedMachineResponse {
  readonly name: string;
  readonly quantity: number;
}

export interface OptimizerResponse {
  readonly name: string;
  readonly fuseCount: number;
  readonly fuseSlots: number;
  readonly boostedMachines: readonly OptimizerBoostedMachineResponse[];
  readonly contribution: number;
  readonly productionRatio?: number;
}

export type PowerBalanceResponse = 'deficit' | 'tight' | 'surplus' | 'balanced';

export interface PlanetEnergyLevelsResponse {
  readonly planetId: number;
  readonly planetName?: string;
  readonly production: number;
  readonly consumption: number;
  readonly available: number;
  readonly balance: PowerBalanceResponse;
  readonly productionBreakdown: readonly EnergyBreakdownEntryResponse[];
  readonly consumptionBreakdown: readonly EnergyBreakdownEntryResponse[];
  readonly optimizers: readonly OptimizerResponse[];
}

export interface EnergyLevelsResponse extends EnergySettingsResponse {
  readonly planets: readonly PlanetEnergyLevelsResponse[];
  readonly worldObjectLabels: WorldObjectLabelsResponse;
}
