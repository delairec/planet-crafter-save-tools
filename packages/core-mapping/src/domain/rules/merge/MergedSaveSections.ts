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
import {EntriesByOrigin} from './EntriesByOrigin';
import {InventoryEntry} from '../../save/InventoryEntry';
import {WorldObjectEntry} from '../../save/WorldObjectEntry';

export interface MergedSaveSections {
  readonly formatRelease: string;
  readonly globalMetadata: GlobalMetadata;
  readonly terraformationLevels: readonly TerraformationLevel[];
  readonly players: EntriesByOrigin<Player>;
  readonly worldObjects: EntriesByOrigin<WorldObjectEntry>;
  readonly inventories: EntriesByOrigin<InventoryEntry>;
  readonly statistics: Statistics | undefined;
  readonly mailboxes: readonly MailboxMessage[];
  readonly storyEvents: readonly StoryEvent[];
  readonly saveConfiguration: SaveConfiguration | undefined;
  readonly terrainLayers: readonly TerrainLayer[] | undefined;
  readonly worldEvents: readonly WorldEvent[];
}
