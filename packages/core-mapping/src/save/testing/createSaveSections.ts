import {GlobalMetadataEntry} from '../domain/save/GlobalMetadataEntry';
import {InventoryEntry} from '../domain/save/InventoryEntry';
import {MailboxMessageEntry} from '../domain/save/MailboxMessageEntry';
import {PlayerEntry} from '../domain/save/PlayerEntry';
import {SaveConfigurationEntry} from '../domain/save/SaveConfigurationEntry';
import {SaveSections} from '../domain/save/SaveSections';
import {StatisticsEntry} from '../domain/save/StatisticsEntry';
import {StoryEventEntry} from '../domain/save/StoryEventEntry';
import {TerraformationLevelEntry} from '../domain/save/TerraformationLevelEntry';
import {TerrainLayerEntry} from '../domain/save/TerrainLayerEntry';
import {WorldEventEntry} from '../domain/save/WorldEventEntry';
import {WorldObjectEntry} from '../domain/save/WorldObjectEntry';
import {createGlobalMetadataEntry} from './createSaveEntries';

interface SaveSectionsOptions {
  formatRelease?: string;
  globalMetadata?: readonly GlobalMetadataEntry[];
  terraformationLevels?: readonly TerraformationLevelEntry[];
  players?: readonly PlayerEntry[];
  worldObjects?: readonly WorldObjectEntry[];
  inventories?: readonly InventoryEntry[];
  statistics?: readonly StatisticsEntry[];
  mailboxes?: readonly MailboxMessageEntry[];
  storyEvents?: readonly StoryEventEntry[];
  saveConfigurations?: readonly SaveConfigurationEntry[];
  terrainLayers?: readonly TerrainLayerEntry[];
  worldEvents?: readonly WorldEventEntry[];
}

export function createSaveSections({
  formatRelease = '2.004',
  globalMetadata = [createGlobalMetadataEntry()],
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
