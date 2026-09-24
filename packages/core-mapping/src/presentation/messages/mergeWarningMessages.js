/** @import { SaveSectionName } from 'shared-save-processing/gameDefinitions' */
import {saveSectionLabels} from './saveSectionLabels.js';

export const unknownMergeWarningMessage = 'The merge raised a warning that has no description.';

/**
 * @param {{formatRelease: string}} mergedSaveFormat
 * @returns {string}
 */
export function formatMergedSaveFormatWarningMessage({formatRelease}) {
  return `The two saves carry different formats; the merged save is written in the format of release ${formatRelease}.`;
}

/**
 * @param {{section: SaveSectionName}} droppedSection
 * @returns {string}
 */
export function formatMergedSaveSectionDroppedWarningMessage({section}) {
  return `Writing that format dropped the ${saveSectionLabels[section]} section.`;
}

/**
 * @param {{formatRelease: string, contentRelease: string}} newerContent
 * @returns {string}
 */
export function formatMergedSaveContentNewerThanFormatWarningMessage({formatRelease, contentRelease}) {
  return `The merged save carries content of a save written in the format of release ${contentRelease} or a later one; the tool dropped none of it, but a game of release ${formatRelease} may not know every object, item or planet it names and may drop them when it loads the save.`;
}
