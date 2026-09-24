/** @import { ParsedSave, SaveParseError, SaveWarning, GlobalMetadata, TerraformationLevel, Player, WorldObject, Inventory, Statistics, MailboxMessage, StoryEvent, SaveConfiguration, WorldEvent } from '../gameDefinitions' */

import {createGlobalMetadata} from './createSaveRecords.js';
import {CURRENT_FORMAT_RELEASE} from '../gameReleases.js';

/** @returns {Generator<never>} */
function* createEmptyGenerator() {
}

/**
 * @typedef {Object} FakeParsedSaveOptions
 * @property {GlobalMetadata[]} [globalMetadata]
 * @property {TerraformationLevel[]} [terraformationLevels]
 * @property {Player[]} [players]
 * @property {() => Generator<WorldObject>} [worldObjects]
 * @property {Inventory[]} [inventories]
 * @property {Statistics[]} [statistics]
 * @property {MailboxMessage[]} [mailboxes]
 * @property {StoryEvent[]} [storyEvents]
 * @property {SaveConfiguration[]} [saveConfigurations]
 * @property {WorldEvent[]} [worldEvents]
 * @property {SaveParseError[]} [errors]
 * @property {SaveWarning[]} [warnings]
 */

/**
 * Creates a fake parsed save (see `ParsedSave`) with one override per section, in business
 * language rather than raw section indexes.
 * @param {FakeParsedSaveOptions} [options]
 * @returns {ParsedSave}
 */
export function createFakeParsedSave({
  globalMetadata = [createGlobalMetadata()],
  terraformationLevels = [],
  players = [],
  worldObjects = () => createEmptyGenerator(),
  inventories = [],
  statistics = [],
  mailboxes = [],
  storyEvents = [],
  saveConfigurations = [],
  worldEvents = [],
  errors = [],
  warnings = []
} = {}) {
  return {
    formatRelease: CURRENT_FORMAT_RELEASE,
    errors,
    warnings,
    sections: [
      globalMetadata,
      terraformationLevels,
      players,
      worldObjects,
      inventories,
      statistics,
      mailboxes,
      storyEvents,
      saveConfigurations,
      worldEvents,
      []
    ]
  };
}
