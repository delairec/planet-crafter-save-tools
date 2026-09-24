/** @import { GlobalMetadata, TerraformationLevel, Player, WorldObject, Inventory, Statistics, MailboxMessage, StoryEvent, SaveConfiguration, TerrainLayer, WorldEvent } from './gameDefinitions' */

import {stringifyEntry} from './stringifyEntry.js';
import {findSplitPartsCount} from './gameReleases.js';
import {LEGACY_SPLIT_PARTS_COUNT} from './sectionIndexes.js';

/**
 * @typedef {Object} SerializeSaveParams
 * @property {string} formatRelease - the release whose format is written
 * @property {GlobalMetadata[]} metadata
 * @property {TerraformationLevel[]} terraformationLevels
 * @property {Player[]} players
 * @property {WorldObject[]} worldObjects
 * @property {Inventory[]} inventories
 * @property {Statistics[]} statistics
 * @property {MailboxMessage[]} mailboxes
 * @property {StoryEvent[]} storyEvents
 * @property {SaveConfiguration[]} saveConfigurations
 * @property {TerrainLayer[]} [terrainLayers] - written by the format of 1.618 alone
 * @property {WorldEvent[]} worldEvents
 */

/** A save is asked in the format of a release the table of game releases does not hold. */
export class UnknownFormatReleaseError extends Error {
  /** @param {string} formatRelease */
  constructor(formatRelease) {
    super(`No game release ${formatRelease} writes a known save format`);
    this.name = 'UnknownFormatReleaseError';
  }
}

const SECTION_SEPARATOR = '\n@\n';
const ENTRY_SEPARATOR = '|\n';
const SAVE_TERMINATOR = '\n@';

/**
 * Assembles the parsed sections back into a Planet Crafter save string, in the format of the release
 * it is given: the format of 1.618 writes the Terrain Layers section between the save configuration
 * and the world events, the format of 2.004 and later does not.
 * @param {SerializeSaveParams} params
 * @returns {string}
 */
export function serializeSave({formatRelease, terrainLayers = [], metadata, terraformationLevels, players, worldObjects, inventories, statistics, mailboxes, storyEvents, saveConfigurations, worldEvents}) {
  const serialize = (entries) => entries.map(entry => JSON.stringify(entry)).join(ENTRY_SEPARATOR);
  const serializeWithFloats = (entries) => entries.map(entry => stringifyEntry(entry)).join(ENTRY_SEPARATOR);
  const serializeSingle = (entry) => entry ? JSON.stringify(entry) : '';

  const sections = [
    serialize(metadata),
    serializeWithFloats(terraformationLevels),
    serializeWithFloats(players),
    serializeWithFloats(worldObjects),
    serialize(inventories),
    serializeSingle(statistics[0]),
    serialize(mailboxes),
    serialize(storyEvents),
    serializeSingle(saveConfigurations[0]),
    ...(writesTerrainLayers(formatRelease) ? [serialize(terrainLayers)] : []),
    serialize(worldEvents),
  ];

  return sections.join(SECTION_SEPARATOR) + SAVE_TERMINATOR;
}

/**
 * @param {string} formatRelease
 * @returns {boolean}
 */
function writesTerrainLayers(formatRelease) {
  const splitPartsCount = findSplitPartsCount(formatRelease);

  if (splitPartsCount === undefined) {
    throw new UnknownFormatReleaseError(formatRelease);
  }

  return splitPartsCount === LEGACY_SPLIT_PARTS_COUNT;
}
