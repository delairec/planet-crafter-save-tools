import {MergedSaveSections} from './MergedSaveSections';
import {SaveSections} from '../../save/SaveSections';
import {createIdSequence} from './createIdSequence';
import {resolveInventoryIdConflicts} from './resolveInventoryIdConflicts';
import {resolveWorldObjectIdConflicts} from './resolveWorldObjectIdConflicts';
import {rewriteInventoryReferences, rewritePlayerReferences, rewriteWorldObjectReferences} from './rewriteReferences';
import {EntriesByOrigin} from './EntriesByOrigin';

export function resolveIdConflicts(mergedSections: MergedSaveSections): SaveSections {
  const idSequence = createIdSequence(
    [...mergedSections.inventories.fromSaveA, ...mergedSections.inventories.fromSaveB],
    [...mergedSections.worldObjects.fromSaveA, ...mergedSections.worldObjects.fromSaveB]
  );

  const inventories = resolveInventoryIdConflicts(mergedSections.inventories, idSequence);
  const worldObjects = resolveWorldObjectIdConflicts(mergedSections.worldObjects, idSequence);

  const remappings = {inventoryIds: inventories.saveBIdRemapping, worldObjectIds: worldObjects.saveBIdRemapping};
  return {
    formatRelease: mergedSections.formatRelease,
    globalMetadata: [mergedSections.globalMetadata],
    terraformationLevels: [...mergedSections.terraformationLevels],
    players: inOriginOrder(rewritePlayerReferences(mergedSections.players, remappings)),
    worldObjects: inOriginOrder(rewriteWorldObjectReferences(worldObjects.entries, remappings)),
    inventories: inOriginOrder(rewriteInventoryReferences(inventories.entries, remappings)),
    statistics: mergedSections.statistics ? [mergedSections.statistics] : [],
    mailboxes: [...mergedSections.mailboxes],
    storyEvents: [...mergedSections.storyEvents],
    saveConfigurations: mergedSections.saveConfiguration ? [mergedSections.saveConfiguration] : [],
    terrainLayers: mergedSections.terrainLayers ? [...mergedSections.terrainLayers] : undefined,
    worldEvents: [...mergedSections.worldEvents]
  };
}

function inOriginOrder<TEntry>({fromSaveA, fromSaveB}: EntriesByOrigin<TEntry>): TEntry[] {
  return [...fromSaveA, ...fromSaveB];
}
