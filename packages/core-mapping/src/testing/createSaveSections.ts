import {
  GlobalMetadata,
  MailboxMessage,
  Player,
  SaveConfiguration,
  Statistics,
  StoryEvent,
  TerraformationLevel,
  WorldEvent
} from 'shared-save-processing/gameDefinitions';
import {createGlobalMetadata} from 'shared-save-processing/testing/createSaveRecords.js';
import {InventoryEntry} from '../domain/rules/merge/InventoryEntry';
import {SaveSections} from '../domain/rules/merge/SaveSections';
import {WorldObjectEntry} from '../domain/rules/merge/WorldObjectEntry';

interface SaveSectionsOptions {
  globalMetadata?: GlobalMetadata[];
  terraformationLevels?: TerraformationLevel[];
  players?: Player[];
  worldObjects?: WorldObjectEntry[];
  inventories?: InventoryEntry[];
  statistics?: Statistics[];
  mailboxes?: MailboxMessage[];
  storyEvents?: StoryEvent[];
  saveConfigurations?: SaveConfiguration[];
  worldEvents?: WorldEvent[];
}

export function createSaveSections({
  globalMetadata = [createGlobalMetadata()],
  terraformationLevels = [],
  players = [],
  worldObjects = [],
  inventories = [],
  statistics = [],
  mailboxes = [],
  storyEvents = [],
  saveConfigurations = [],
  worldEvents = []
}: SaveSectionsOptions = {}): SaveSections {
  return {
    globalMetadata,
    terraformationLevels,
    players,
    worldObjects,
    inventories,
    statistics,
    mailboxes,
    storyEvents,
    saveConfigurations,
    worldEvents
  };
}
