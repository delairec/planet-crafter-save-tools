import {EntriesByOrigin} from './EntriesByOrigin';
import {GlobalMetadataEntry} from '../../save/GlobalMetadataEntry';
import {InventoryEntry} from '../../save/InventoryEntry';
import {MailboxMessageEntry} from '../../save/MailboxMessageEntry';
import {PlayerEntry} from '../../save/PlayerEntry';
import {SaveConfigurationEntry} from '../../save/SaveConfigurationEntry';
import {StatisticsEntry} from '../../save/StatisticsEntry';
import {StoryEventEntry} from '../../save/StoryEventEntry';
import {TerraformationLevelEntry} from '../../save/TerraformationLevelEntry';
import {TerrainLayerEntry} from '../../save/TerrainLayerEntry';
import {WorldEventEntry} from '../../save/WorldEventEntry';
import {WorldObjectEntry} from '../../save/WorldObjectEntry';

export interface MergedSaveSections {
  readonly formatRelease: string;
  readonly globalMetadata: GlobalMetadataEntry;
  readonly terraformationLevels: readonly TerraformationLevelEntry[];
  readonly players: EntriesByOrigin<PlayerEntry>;
  readonly worldObjects: EntriesByOrigin<WorldObjectEntry>;
  readonly inventories: EntriesByOrigin<InventoryEntry>;
  readonly statistics: StatisticsEntry | undefined;
  readonly mailboxes: readonly MailboxMessageEntry[];
  readonly storyEvents: readonly StoryEventEntry[];
  readonly saveConfiguration: SaveConfigurationEntry | undefined;
  readonly terrainLayers: readonly TerrainLayerEntry[] | undefined;
  readonly worldEvents: readonly WorldEventEntry[];
}
