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
import {EntriesByOrigin} from './EntriesByOrigin';
import {DecodedInventory} from './DecodedInventory';
import {DecodedWorldObject} from './DecodedWorldObject';

/**
 * The ten sections of a save once merged, still structured: serialization happens in
 * infrastructure, after id conflict resolution.
 *
 * Statistics and the save configuration are single-entry sections, absent when neither save
 * carries them.
 */
export interface MergedSaveSections {
  readonly globalMetadata: GlobalMetadata;
  readonly terraformationLevels: readonly TerraformationLevel[];
  readonly players: EntriesByOrigin<Player>;
  readonly worldObjects: EntriesByOrigin<DecodedWorldObject>;
  readonly inventories: EntriesByOrigin<DecodedInventory>;
  readonly statistics: Statistics | undefined;
  readonly mailboxes: readonly MailboxMessage[];
  readonly storyEvents: readonly StoryEvent[];
  readonly saveConfiguration: SaveConfiguration | undefined;
  readonly worldEvents: readonly WorldEvent[];
}
