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
import {InventoryEntry} from './InventoryEntry';
import {WorldObjectEntry} from './WorldObjectEntry';

export interface SaveSections {
  readonly globalMetadata: GlobalMetadata[];
  readonly terraformationLevels: TerraformationLevel[];
  readonly players: Player[];
  readonly worldObjects: WorldObjectEntry[];
  readonly inventories: InventoryEntry[];
  readonly statistics: Statistics[];
  readonly mailboxes: MailboxMessage[];
  readonly storyEvents: StoryEvent[];
  readonly saveConfigurations: SaveConfiguration[];
  readonly worldEvents: WorldEvent[];
}
