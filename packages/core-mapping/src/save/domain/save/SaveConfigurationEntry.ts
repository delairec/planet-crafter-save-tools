export interface SaveConfigurationEntry {
  readonly saveDisplayName: string;
  readonly planetId: string;
  readonly version: string;
  readonly mode: string;
  readonly worldSeed: number;
  readonly modded: boolean;
  readonly modifierTerraformationPace: number;
  readonly modifierPowerConsumption: number;
  readonly modifierGaugeDrain: number;
  readonly modifierMeteoOccurence: number;
  readonly modifierMultiplayerTerraformationFactor: number;
  readonly unlockedSpaceTrading: boolean;
  readonly unlockedOreExtrators: boolean;
  readonly unlockedTeleporters: boolean;
  readonly unlockedDrones: boolean;
  readonly unlockedAutocrafter: boolean;
  readonly unlockedEverything: boolean;
  readonly freeCraft: boolean;
  readonly preInterplanetarySave: boolean;
  readonly randomizeMineables: boolean;
  readonly dyingConsequencesLabel: string;
  readonly startLocationLabel: string;
  readonly hasPlayedIntro: boolean;
  readonly gameStartLocation: string;
}
