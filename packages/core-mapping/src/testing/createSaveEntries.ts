import {GlobalMetadataEntry} from '../domain/save/GlobalMetadataEntry';
import {MailboxMessageEntry} from '../domain/save/MailboxMessageEntry';
import {PlayerEntry} from '../domain/save/PlayerEntry';
import {SaveConfigurationEntry} from '../domain/save/SaveConfigurationEntry';
import {StatisticsEntry} from '../domain/save/StatisticsEntry';
import {StoryEventEntry} from '../domain/save/StoryEventEntry';
import {TerraformationLevelEntry} from '../domain/save/TerraformationLevelEntry';
import {TerrainLayerEntry} from '../domain/save/TerrainLayerEntry';
import {WorldEventEntry} from '../domain/save/WorldEventEntry';

export function createPlayerEntry(overrides: Partial<PlayerEntry> = {}): PlayerEntry {
  return {
    id: '76561190000000001',
    name: 'Nikowa',
    inventoryId: 44,
    equipmentId: 45,
    playerPosition: '1751.865,472.58,-1106.104',
    playerRotation: '0,0.5740051,0,-0.8188518',
    playerGaugeOxygen: 280.0,
    playerGaugeThirst: 96.3858642578125,
    playerGaugeHealth: 72.67363739013672,
    playerGaugeToxic: 0.0,
    host: true,
    planetId: 'Toxicity',
    cameraView: 0,
    totalCraftedObjects: 1820,
    totalTerraTokenEarned: 9000,
    ...overrides
  };
}

export function createSaveConfigurationEntry(overrides: Partial<SaveConfigurationEntry> = {}): SaveConfigurationEntry {
  return {
    saveDisplayName: 'Merged Save',
    planetId: 'Toxicity',
    unlockedSpaceTrading: false,
    unlockedOreExtrators: false,
    unlockedTeleporters: false,
    unlockedDrones: false,
    unlockedAutocrafter: false,
    unlockedEverything: false,
    freeCraft: false,
    preInterplanetarySave: false,
    randomizeMineables: false,
    modifierTerraformationPace: 0.1,
    modifierPowerConsumption: 0.2,
    modifierGaugeDrain: 0.3,
    modifierMeteoOccurence: 0.4,
    modifierMultiplayerTerraformationFactor: 0.5,
    modded: false,
    version: '2.004',
    mode: 'Standard',
    dyingConsequencesLabel: 'DropSomeItems',
    startLocationLabel: 'Standard',
    worldSeed: 42,
    hasPlayedIntro: true,
    gameStartLocation: 'Standard',
    ...overrides
  };
}

export function createGlobalMetadataEntry(overrides: Partial<GlobalMetadataEntry> = {}): GlobalMetadataEntry {
  return {
    terraTokens: 100,
    allTimeTerraTokens: 200_345,
    unlockedGroups: ['BootsSpeed1'],
    openedInstanceSeed: 0,
    openedInstanceTimeLeft: 0,
    ...overrides
  };
}

export function createTerraformationLevelEntry(overrides: Partial<TerraformationLevelEntry> = {}): TerraformationLevelEntry {
  return {
    planetId: 'Toxicity',
    unitOxygenLevel: 100.0,
    unitHeatLevel: 200.0,
    unitPressureLevel: 300.0,
    unitPlantsLevel: 400.0,
    unitInsectsLevel: 500.0,
    unitAnimalsLevel: 600.0,
    unitPurificationLevel: 700.0,
    ...overrides
  };
}

export function createStatisticsEntry(overrides: Partial<StatisticsEntry> = {}): StatisticsEntry {
  return {craftedObjects: 10, totalSaveFileLoad: 5, totalSaveFileTime: 3600, ...overrides};
}

export function createMailboxMessageEntry(overrides: Partial<MailboxMessageEntry> = {}): MailboxMessageEntry {
  return {stringId: 'MailWelcome', isRead: false, ...overrides};
}

export function createStoryEventEntry(overrides: Partial<StoryEventEntry> = {}): StoryEventEntry {
  return {stringId: 'StoryFirstLaunch', ...overrides};
}

export function createWorldEventEntry(overrides: Partial<WorldEventEntry> = {}): WorldEventEntry {
  return {planet: 110910045, seed: 1, position: '0,0,0', ...overrides};
}

export function createTerrainLayerEntry(overrides: Partial<TerrainLayerEntry> = {}): TerrainLayerEntry {
  return {
    layerId: 'PC-Toxicity-Layer2',
    planet: 110910045,
    colorBase: '0.5-0.5-0.5-1',
    colorCustom: '1-1-1-1',
    colorBaseLerp: 100,
    colorCustomLerp: 0,
    ...overrides
  };
}
