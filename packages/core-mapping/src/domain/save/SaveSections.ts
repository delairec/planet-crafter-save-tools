import {GlobalMetadataEntry} from './GlobalMetadataEntry';
import {InventoryEntry} from './InventoryEntry';
import {MailboxMessageEntry} from './MailboxMessageEntry';
import {PlayerEntry} from './PlayerEntry';
import {SaveConfigurationEntry} from './SaveConfigurationEntry';
import {StatisticsEntry} from './StatisticsEntry';
import {StoryEventEntry} from './StoryEventEntry';
import {TerraformationLevelEntry} from './TerraformationLevelEntry';
import {TerrainLayerEntry} from './TerrainLayerEntry';
import {WorldEventEntry} from './WorldEventEntry';
import {WorldObjectEntry} from './WorldObjectEntry';

export interface SaveSections {
  readonly formatRelease: string;
  readonly globalMetadata: readonly GlobalMetadataEntry[];
  readonly terraformationLevels: readonly TerraformationLevelEntry[];
  readonly players: readonly PlayerEntry[];
  readonly worldObjects: readonly WorldObjectEntry[];
  readonly inventories: readonly InventoryEntry[];
  readonly statistics: readonly StatisticsEntry[];
  readonly mailboxes: readonly MailboxMessageEntry[];
  readonly storyEvents: readonly StoryEventEntry[];
  readonly saveConfigurations: readonly SaveConfigurationEntry[];
  readonly terrainLayers: readonly TerrainLayerEntry[] | undefined;
  readonly worldEvents: readonly WorldEventEntry[];
}
