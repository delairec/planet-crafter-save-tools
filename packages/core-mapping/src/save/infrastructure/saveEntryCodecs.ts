import {parseIdList, serializeIdList} from "shared-save-processing/idList.js";
import {parseGroupList, serializeGroupList} from "shared-save-processing/groupList.js";
import {
  GlobalMetadata,
  Inventory,
  MailboxMessage,
  Player,
  SaveConfiguration,
  SaveSectionName,
  Statistics,
  StoryEvent,
  TerraformationLevel,
  TerrainLayer,
  WorldEvent,
  WorldObject
} from "shared-save-processing/gameDefinitions";
import {GlobalMetadataEntry} from "../domain/save/GlobalMetadataEntry";
import {InventoryEntry} from "../domain/save/InventoryEntry";
import {MailboxMessageEntry} from "../domain/save/MailboxMessageEntry";
import {PlayerEntry} from "../domain/save/PlayerEntry";
import {SaveConfigurationEntry} from "../domain/save/SaveConfigurationEntry";
import {StatisticsEntry} from "../domain/save/StatisticsEntry";
import {StoryEventEntry} from "../domain/save/StoryEventEntry";
import {TerraformationLevelEntry} from "../domain/save/TerraformationLevelEntry";
import {TerrainLayerEntry} from "../domain/save/TerrainLayerEntry";
import {WorldEventEntry} from "../domain/save/WorldEventEntry";
import {WorldObjectEntry} from "../domain/save/WorldObjectEntry";
import {UnexpectedSaveEntryFieldError} from "./errors/UnexpectedSaveEntryFieldError";
import {UnreadableSaveEntryValueError} from "./errors/UnreadableSaveEntryValueError";
import {parseWorldObjectPosition} from "./parseWorldObjectPosition";

interface FieldLocation {
  readonly section: SaveSectionName;
  readonly field: string;
}

interface FieldCodec<Entry> {
  readonly name: keyof Entry & string;
  readonly decode?: (value: unknown, location: FieldLocation) => unknown;
  readonly encode?: (value: unknown) => unknown;
}

type FieldCodecs<Record, Entry> = {readonly [Field in keyof Required<Record>]: FieldCodec<Entry>};

interface RecordField<Record, Entry> {
  readonly field: keyof Record & string;
  readonly codec: FieldCodec<Entry>;
}

export interface EntryCodec<Record, Entry> {
  readonly section: SaveSectionName;
  readonly codecsByRecordField: ReadonlyMap<string, FieldCodec<Entry>>;
  readonly recordFieldsByName: ReadonlyMap<string, RecordField<Record, Entry>>;
}

const idList = {
  decode: (value: unknown, location: FieldLocation): number[] => {
    if (typeof value !== 'string') {
      throw new UnreadableSaveEntryValueError(location.section, location.field, value);
    }
    const ids = parseIdList(value);
    if (ids.some(id => !Number.isSafeInteger(id))) {
      throw new UnreadableSaveEntryValueError(location.section, location.field, value);
    }
    return ids;
  },
  encode: (value: unknown): string | undefined => value === undefined ? undefined : serializeIdList(value as number[])
};

const groupList = {
  decode: (value: unknown): string[] => parseGroupList(value as string),
  encode: (value: unknown): string | undefined => value === undefined ? undefined : serializeGroupList(value as string[])
};

const worldObjectPosition = {
  decode: (value: unknown, location: FieldLocation): string => {
    if (parseWorldObjectPosition(String(value)) === undefined) {
      throw new UnreadableSaveEntryValueError(location.section, location.field, value);
    }
    return value as string;
  }
};

const planetStoodOn = {
  decode: (value: unknown): string | undefined => value === '' ? undefined : value as string,
  encode: (value: unknown): string => value === undefined ? '' : value as string
};

const PURIFICATION_NOT_HANDLED_LEVEL = -1;

const purificationLevel = {
  decode: (value: unknown): number | undefined => value === PURIFICATION_NOT_HANDLED_LEVEL ? undefined : value as number,
  encode: (value: unknown): number => value === undefined ? PURIFICATION_NOT_HANDLED_LEVEL : value as number
};

function keepNames<Name extends string>(...names: Name[]): {readonly [Field in Name]: {readonly name: Field}} {
  return Object.fromEntries(names.map(name => [name, {name}])) as {readonly [Field in Name]: {readonly name: Field}};
}

function defineEntryCodec<Record, Entry>(section: SaveSectionName, fieldCodecs: FieldCodecs<Record, Entry>): EntryCodec<Record, Entry> {
  const codecsByRecordField = new Map(Object.entries<FieldCodec<Entry>>(fieldCodecs));
  const recordFieldsByName = new Map([...codecsByRecordField].map(([field, codec]) => [codec.name as string, {field: field as keyof Record & string, codec}]));
  return {section, codecsByRecordField, recordFieldsByName};
}

export const GLOBAL_METADATA_CODEC = defineEntryCodec<GlobalMetadata, GlobalMetadataEntry>('globalMetadata', {
  ...keepNames('terraTokens', 'allTimeTerraTokens', 'openedInstanceSeed', 'openedInstanceTimeLeft', 'logisticsPaused'),
  unlockedGroups: {name: 'unlockedGroups', ...groupList}
});

export const TERRAFORMATION_LEVEL_CODEC = defineEntryCodec<TerraformationLevel, TerraformationLevelEntry>('terraformationLevels', {
  ...keepNames(
    'planetId', 'unitOxygenLevel', 'unitHeatLevel', 'unitPressureLevel', 'unitPlantsLevel', 'unitInsectsLevel', 'unitAnimalsLevel'
  ),
  unitPurificationLevel: {name: 'unitPurificationLevel', ...purificationLevel}
});

export const PLAYER_CODEC = defineEntryCodec<Player, PlayerEntry>('players', {
  ...keepNames(
    'id', 'name', 'inventoryId', 'equipmentId', 'playerPosition', 'playerRotation', 'playerGaugeOxygen', 'playerGaugeThirst',
    'playerGaugeHealth', 'playerGaugeToxic', 'host', 'cameraView', 'totalCraftedObjects', 'totalTerraTokenEarned'
  ),
  planetId: {name: 'planetId', ...planetStoodOn}
});

export const WORLD_OBJECT_CODEC = defineEntryCodec<WorldObject, WorldObjectEntry>('worldObjects', {
  ...keepNames('id', 'planet', 'count', 'color', 'text', 'hunger'),
  gId: {name: 'groupId'},
  pos: {name: 'position', ...worldObjectPosition},
  rot: {name: 'rotation'},
  grwth: {name: 'growth'},
  pnls: {name: 'panels'},
  trtInd: {name: 'terraformationStageIndex'},
  liId: {name: 'linkedInventoryId'},
  liPlanet: {name: 'linkedInventoryPlanet'},
  liGrps: {name: 'logisticGroups', ...groupList},
  linkedWo: {name: 'linkedWorldObjectId'},
  siIds: {name: 'subInventoryIds', ...idList},
  woIds: {name: 'heldWorldObjectIds', ...idList},
  trtVal: {name: 'terraformationContribution'},
  set: {name: 'equipmentSet'}
});

export const INVENTORY_CODEC = defineEntryCodec<Inventory, InventoryEntry>('inventories', {
  ...keepNames('id', 'size', 'priority'),
  woIds: {name: 'worldObjectIds', ...idList},
  demandGrps: {name: 'demandGroups', ...groupList},
  supplyGrps: {name: 'supplyGroups', ...groupList}
});

export const STATISTICS_CODEC = defineEntryCodec<Statistics, StatisticsEntry>('statistics', keepNames(
  'craftedObjects', 'totalSaveFileLoad', 'totalSaveFileTime'
));

export const MAILBOX_MESSAGE_CODEC = defineEntryCodec<MailboxMessage, MailboxMessageEntry>('mailboxMessages', keepNames('stringId', 'isRead'));

export const STORY_EVENT_CODEC = defineEntryCodec<StoryEvent, StoryEventEntry>('storyEvents', keepNames('stringId'));

export const SAVE_CONFIGURATION_CODEC = defineEntryCodec<SaveConfiguration, SaveConfigurationEntry>('saveConfiguration', keepNames(
  'saveDisplayName', 'planetId', 'version', 'mode', 'worldSeed', 'modded', 'modifierTerraformationPace', 'modifierPowerConsumption',
  'modifierGaugeDrain', 'modifierMeteoOccurence', 'modifierMultiplayerTerraformationFactor', 'unlockedSpaceTrading',
  'unlockedOreExtrators', 'unlockedTeleporters', 'unlockedDrones', 'unlockedAutocrafter', 'unlockedEverything', 'freeCraft',
  'preInterplanetarySave', 'randomizeMineables', 'dyingConsequencesLabel', 'startLocationLabel', 'hasPlayedIntro', 'gameStartLocation'
));

export const TERRAIN_LAYER_CODEC = defineEntryCodec<TerrainLayer, TerrainLayerEntry>('terrainLayers', keepNames(
  'layerId', 'planet', 'colorBase', 'colorCustom', 'colorBaseLerp', 'colorCustomLerp'
));

export const WORLD_EVENT_CODEC = defineEntryCodec<WorldEvent, WorldEventEntry>('worldEvents', {
  ...keepNames('planet', 'seed', 'owner', 'index', 'version'),
  pos: {name: 'position'},
  rot: {name: 'rotation'},
  wrecksWOGenerated: {name: 'wrecksGenerated'},
  woIdsGenerated: {name: 'generatedWorldObjectIds', ...idList},
  woIdsDropped: {name: 'droppedWorldObjectIds', ...idList}
});

export function decodeEntry<Record extends object, Entry>(record: Record, {section, codecsByRecordField}: EntryCodec<Record, Entry>): Entry {
  return Object.fromEntries(Object.entries(record).map(([field, value]) => {
    const codec = codecsByRecordField.get(field);
    if (codec === undefined) {
      throw new UnexpectedSaveEntryFieldError(section, field);
    }
    return [codec.name, codec.decode === undefined ? value : codec.decode(value, {section, field})];
  })) as Entry;
}

export function encodeEntry<Record, Entry extends object>(entry: Entry, {section, recordFieldsByName}: EntryCodec<Record, Entry>): Record {
  return Object.fromEntries(Object.entries(entry).map(([name, value]) => {
    const recordField = recordFieldsByName.get(name);
    if (recordField === undefined) {
      throw new UnexpectedSaveEntryFieldError(section, name);
    }
    const {field, codec} = recordField;
    return [field, codec.encode === undefined ? value : codec.encode(value)];
  })) as Record;
}
