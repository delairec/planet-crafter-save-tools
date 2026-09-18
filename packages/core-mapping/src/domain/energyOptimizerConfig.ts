import {WorldObjectName} from "./worldObjectNames";
import optimizerConfig from './optimizerConfig.json' with {type: 'json'};

export const OPTIMIZER_CONFIG_BY_NAME: Partial<Record<WorldObjectName, { radius: number; maxMachines: number }>> = Object.fromEntries(
  optimizerConfig.map((optimizer) => [optimizer.worldObjectName, {radius: optimizer.radius, maxMachines: optimizer.maxMachines}])
);

export const ENERGY_FUSE_NAME: WorldObjectName = 'FuseEnergy1';

// Rule EN-FUSE-2/3 (per Fuse wiki page): each Energy Fuse replaces the producer's 100% base value
// with a 150% multiplier; multiple fuses (from one or more Optimizers) stack additively by raw
// percentage — e.g. 2 fuses => 300%, not 200%. A producer reached by zero fuses stays at 100%.
export const ENERGY_FUSE_MULTIPLIER_PER_FUSE = 1.5;
