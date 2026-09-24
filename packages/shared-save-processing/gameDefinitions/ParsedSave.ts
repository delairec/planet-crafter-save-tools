import {GlobalMetadata} from "./GlobalMetadata";
import {TerraformationLevel} from "./TerraformationLevel";
import {Player} from "./Player";
import {WorldObject} from "./WorldObject";
import {Inventory} from "./Inventory";
import {Statistics} from "./Statistics";
import {MailboxMessage} from "./MailboxMessage";
import {StoryEvent} from "./StoryEvent";
import {SaveConfiguration} from "./SaveConfiguration";
import {TerrainLayer} from "./TerrainLayer";
import {WorldEvent} from "./WorldEvent";
import {SaveWarning} from "./SaveWarning";
import {SaveParseError} from "./SaveParseError";

type SectionsBeforeTerrainLayers = [
  GlobalMetadata[],
  TerraformationLevel[],
  Player[],
  () => Generator<WorldObject>,
  Inventory[],
  Statistics[],
  MailboxMessage[],
  StoryEvent[],
  SaveConfiguration[]
];

/** The eleven parts of the format of 2.004 and later. */
export type CurrentFormatSections = [...SectionsBeforeTerrainLayers, WorldEvent[], never[]];

/** The twelve parts of the format of 1.618 and earlier, Terrain Layers at index 9. */
export type LegacyFormatSections = [...SectionsBeforeTerrainLayers, TerrainLayer[], WorldEvent[], never[]];

export type ParsedSections = CurrentFormatSections | LegacyFormatSections;

export type ParsedSave = {
  /** The release whose format the save carries; undefined when no release writes its part count. */
  formatRelease: string | undefined;
  sections: ParsedSections;
  errors: SaveParseError[];
  warnings: SaveWarning[];
};
