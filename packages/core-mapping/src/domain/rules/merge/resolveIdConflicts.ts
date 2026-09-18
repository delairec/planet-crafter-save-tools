import {MergedSaveSections} from './MergedSaveSections';
import {SaveSections} from '../../save/SaveSections';
import {createIdSequence} from './createIdSequence';
import {resolveInventoryIdConflicts} from './resolveInventoryIdConflicts';
import {resolveWorldObjectIdConflicts} from './resolveWorldObjectIdConflicts';
import {rewriteInventoryReferences, rewritePlayerReferences, rewriteWorldObjectReferences} from './rewriteReferences';
import {EntriesByOrigin} from './EntriesByOrigin';

/**
 * Renumbers the save B inventories and world objects whose identifier is already used in save A,
 * then points every save B back-reference at the new identifiers.
 *
 * Players are left out: their identifier is a Steam account identifier, which no entry references
 * and which the game reuses from one save to the next, so a duplicate between the two saves is not
 * a conflict to resolve.
 *
 * The origin of an entry has no consumer past this point, so the result is a save like any other:
 * the entries of save A come first, those of save B follow.
 *
 * @see @RULE.IdentifiersAreSharedByInventoriesAndWorldObjects, @RULE.DuplicateIdentifiersAreRemappedOnTheSaveBSide
 */
export function resolveIdConflicts(mergedSections: MergedSaveSections): SaveSections {
  const idSequence = createIdSequence(
    [...mergedSections.inventories.fromSaveA, ...mergedSections.inventories.fromSaveB],
    [...mergedSections.worldObjects.fromSaveA, ...mergedSections.worldObjects.fromSaveB]
  );

  const inventories = resolveInventoryIdConflicts(mergedSections.inventories, idSequence);
  const worldObjects = resolveWorldObjectIdConflicts(mergedSections.worldObjects, idSequence);

  const remappings = {inventoryIds: inventories.saveBIdRemapping, worldObjectIds: worldObjects.saveBIdRemapping};
  return {
    globalMetadata: [mergedSections.globalMetadata],
    terraformationLevels: [...mergedSections.terraformationLevels],
    players: inOriginOrder(rewritePlayerReferences(mergedSections.players, remappings)),
    worldObjects: inOriginOrder(rewriteWorldObjectReferences(worldObjects.entries, remappings)),
    inventories: inOriginOrder(rewriteInventoryReferences(inventories.entries, remappings)),
    statistics: mergedSections.statistics ? [mergedSections.statistics] : [],
    mailboxes: [...mergedSections.mailboxes],
    storyEvents: [...mergedSections.storyEvents],
    saveConfigurations: mergedSections.saveConfiguration ? [mergedSections.saveConfiguration] : [],
    worldEvents: [...mergedSections.worldEvents]
  };
}

function inOriginOrder<TEntry>({fromSaveA, fromSaveB}: EntriesByOrigin<TEntry>): TEntry[] {
  return [...fromSaveA, ...fromSaveB];
}
