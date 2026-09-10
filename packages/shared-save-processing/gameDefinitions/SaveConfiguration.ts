/**
 * Wire DTO mirroring section 8 of the save format. Field names are the game's, abbreviations
 * included; the domain translates them into business language at its boundary.
 */
export interface SaveConfiguration {
  saveDisplayName: string;
  planetId: string;
  version: string;
  mode: string;
  worldSeed: number;
  modded: boolean;
  modifierTerraformationPace: number;
  modifierPowerConsumption: number;
  modifierGaugeDrain: number;
  modifierMeteoOccurence: number;
  modifierMultiplayerTerraformationFactor: number;
  unlockedSpaceTrading: boolean;
  unlockedOreExtrators: boolean;
  unlockedTeleporters: boolean;
  unlockedDrones: boolean;
  unlockedAutocrafter: boolean;
  unlockedEverything: boolean;
  freeCraft: boolean;
  preInterplanetarySave: boolean;
  randomizeMineables: boolean;
  dyingConsequencesLabel: string;
  startLocationLabel: string;
  hasPlayedIntro: boolean;
  gameStartLocation: string;
}
