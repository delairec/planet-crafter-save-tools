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
import {DecodedInventory} from './DecodedInventory';
import {DecodedWorldObject} from './DecodedWorldObject';

/**
 * The eleven parts of a parsed save once the identifier lists of its inventories and world objects
 * are decoded: what the merge rules take as input.
 */
export type DecodedSections = [
  GlobalMetadata[],
  TerraformationLevel[],
  Player[],
  () => Generator<DecodedWorldObject>,
  DecodedInventory[],
  Statistics[],
  MailboxMessage[],
  StoryEvent[],
  SaveConfiguration[],
  WorldEvent[],
  never[]
];
