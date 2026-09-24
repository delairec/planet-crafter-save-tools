import {
  GlobalMetadata,
  MailboxMessage,
  Player,
  SaveConfiguration,
  Statistics,
  StoryEvent,
  TerraformationLevel,
  TerrainLayer,
  WorldEvent
} from 'shared-save-processing/gameDefinitions';
import {createGlobalMetadata} from 'shared-save-processing/testing/createSaveRecords.js';
import {InventoryEntry} from '../domain/save/InventoryEntry';
import {SaveSections} from '../domain/save/SaveSections';
import {WorldObjectEntry} from '../domain/save/WorldObjectEntry';

interface SaveSectionsOptions {
  formatRelease?: string;
  globalMetadata?: GlobalMetadata[];
  terraformationLevels?: TerraformationLevel[];
  players?: Player[];
  worldObjects?: WorldObjectEntry[];
  inventories?: InventoryEntry[];
  statistics?: Statistics[];
  mailboxes?: MailboxMessage[];
  storyEvents?: StoryEvent[];
  saveConfigurations?: SaveConfiguration[];
  terrainLayers?: TerrainLayer[];
  worldEvents?: WorldEvent[];
}

export function createSaveSections({
  formatRelease = '2.004',
  globalMetadata = [createGlobalMetadata()],
  terraformationLevels = [],
  players = [],
  worldObjects = [],
  inventories = [],
  statistics = [],
  mailboxes = [],
  storyEvents = [],
  saveConfigurations = [],
  terrainLayers = undefined,
  worldEvents = []
}: SaveSectionsOptions = {}): SaveSections {
  return {
    formatRelease,
    globalMetadata,
    terraformationLevels,
    players,
    worldObjects,
    inventories,
    statistics,
    mailboxes,
    storyEvents,
    saveConfigurations,
    terrainLayers,
    worldEvents
  };
}
