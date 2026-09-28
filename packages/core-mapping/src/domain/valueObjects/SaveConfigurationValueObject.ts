import {assertBoolean, assertFiniteNumber, assertNonEmptyString} from "../errors/assertions";

export interface SaveConfigurationValueObject {
  readonly title: string;
  readonly mode: string;
  readonly modifiers: {
    readonly terraformationPace: number;
    readonly powerConsumption: number;
    readonly gaugeDrain: number;
    readonly meteoOccurrence: number;
    readonly multiplayerFactor: number;
  };
  readonly unlocks: {
    readonly freeCraft: boolean;
    readonly everythingUnlocked: boolean;
    readonly spaceTrading: boolean;
    readonly oreExtractors: boolean;
    readonly teleporters: boolean;
    readonly drones: boolean;
    readonly autocrafter: boolean;
    readonly randomizedMineables: boolean;
  };
}

export function createSaveConfigurationValueObject(input: SaveConfigurationValueObject): SaveConfigurationValueObject {
  return {
    title: assertNonEmptyString(input.title, 'SaveConfigurationValueObject.title'),
    mode: assertNonEmptyString(input.mode, 'SaveConfigurationValueObject.mode'),
    modifiers: {
      terraformationPace: assertFiniteNumber(input.modifiers.terraformationPace, 'SaveConfigurationValueObject.modifiers.terraformationPace'),
      powerConsumption: assertFiniteNumber(input.modifiers.powerConsumption, 'SaveConfigurationValueObject.modifiers.powerConsumption'),
      gaugeDrain: assertFiniteNumber(input.modifiers.gaugeDrain, 'SaveConfigurationValueObject.modifiers.gaugeDrain'),
      meteoOccurrence: assertFiniteNumber(input.modifiers.meteoOccurrence, 'SaveConfigurationValueObject.modifiers.meteoOccurrence'),
      multiplayerFactor: assertFiniteNumber(input.modifiers.multiplayerFactor, 'SaveConfigurationValueObject.modifiers.multiplayerFactor')
    },
    unlocks: {
      freeCraft: assertBoolean(input.unlocks.freeCraft, 'SaveConfigurationValueObject.unlocks.freeCraft'),
      everythingUnlocked: assertBoolean(input.unlocks.everythingUnlocked, 'SaveConfigurationValueObject.unlocks.everythingUnlocked'),
      spaceTrading: assertBoolean(input.unlocks.spaceTrading, 'SaveConfigurationValueObject.unlocks.spaceTrading'),
      oreExtractors: assertBoolean(input.unlocks.oreExtractors, 'SaveConfigurationValueObject.unlocks.oreExtractors'),
      teleporters: assertBoolean(input.unlocks.teleporters, 'SaveConfigurationValueObject.unlocks.teleporters'),
      drones: assertBoolean(input.unlocks.drones, 'SaveConfigurationValueObject.unlocks.drones'),
      autocrafter: assertBoolean(input.unlocks.autocrafter, 'SaveConfigurationValueObject.unlocks.autocrafter'),
      randomizedMineables: assertBoolean(input.unlocks.randomizedMineables, 'SaveConfigurationValueObject.unlocks.randomizedMineables')
    }
  };
}
