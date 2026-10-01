import {EntriesByOrigin} from './EntriesByOrigin';
import {GlobalMetadataEntry} from '../../../save/domain/save/GlobalMetadataEntry';
import {InventoryEntry} from '../../../save/domain/save/InventoryEntry';
import {MailboxMessageEntry} from '../../../save/domain/save/MailboxMessageEntry';
import {PlayerEntry} from '../../../save/domain/save/PlayerEntry';
import {SaveConfigurationEntry} from '../../../save/domain/save/SaveConfigurationEntry';
import {StatisticsEntry} from '../../../save/domain/save/StatisticsEntry';
import {StoryEventEntry} from '../../../save/domain/save/StoryEventEntry';
import {TerraformationLevelEntry} from '../../../save/domain/save/TerraformationLevelEntry';
import {TerrainLayerEntry} from '../../../save/domain/save/TerrainLayerEntry';
import {WorldEventEntry} from '../../../save/domain/save/WorldEventEntry';
import {WorldObjectEntry} from '../../../save/domain/save/WorldObjectEntry';

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
