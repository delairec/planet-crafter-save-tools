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
import {DecodedInventory} from '../domain/rules/merge/DecodedInventory';
import {DecodedSections} from '../domain/rules/merge/DecodedSections';
import {DecodedWorldObject} from '../domain/rules/merge/DecodedWorldObject';

interface DecodedSectionsOptions {
  globalMetadata?: GlobalMetadata[];
  terraformationLevels?: TerraformationLevel[];
  players?: Player[];
  worldObjects?: () => Generator<DecodedWorldObject>;
  inventories?: DecodedInventory[];
  statistics?: Statistics[];
  mailboxes?: MailboxMessage[];
  storyEvents?: StoryEvent[];
  saveConfigurations?: SaveConfiguration[];
  worldEvents?: WorldEvent[];
}

function* createEmptyGenerator(): Generator<never> {
}

/**
 * The sections the merge rules take as input, with one override per section in business language
 * rather than raw section indexes.
 */
export function createDecodedSections({
  globalMetadata = [createGlobalMetadata()],
  terraformationLevels = [],
  players = [],
  worldObjects = () => createEmptyGenerator(),
  inventories = [],
  statistics = [],
  mailboxes = [],
  storyEvents = [],
  saveConfigurations = [],
  worldEvents = []
}: DecodedSectionsOptions = {}): DecodedSections {
  return [
    globalMetadata,
    terraformationLevels,
    players,
    worldObjects,
    inventories,
    statistics,
    mailboxes,
    storyEvents,
    saveConfigurations,
    worldEvents,
    []
  ];
}
