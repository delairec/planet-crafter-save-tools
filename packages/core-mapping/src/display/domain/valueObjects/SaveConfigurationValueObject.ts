
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
    title: input.title,
    mode: input.mode,
    modifiers: {
      terraformationPace: input.modifiers.terraformationPace,
      powerConsumption: input.modifiers.powerConsumption,
      gaugeDrain: input.modifiers.gaugeDrain,
      meteoOccurrence: input.modifiers.meteoOccurrence,
      multiplayerFactor: input.modifiers.multiplayerFactor
    },
    unlocks: {
      freeCraft: input.unlocks.freeCraft,
      everythingUnlocked: input.unlocks.everythingUnlocked,
      spaceTrading: input.unlocks.spaceTrading,
      oreExtractors: input.unlocks.oreExtractors,
      teleporters: input.unlocks.teleporters,
      drones: input.unlocks.drones,
      autocrafter: input.unlocks.autocrafter,
      randomizedMineables: input.unlocks.randomizedMineables
    }
  };
}
