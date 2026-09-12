import {mergeGlobalMetadata} from './mergeGlobalMetadata';
import {mergeTerraformationLevels} from './mergeTerraformationLevels';
import {mergePlayers} from './mergePlayers';
import {mergeWorldObjects} from './mergeWorldObjects';
import {mergeInventories} from './mergeInventories';
import {mergeStatistics} from './mergeStatistics';
import {mergeMailboxes} from './mergeMailboxes';
import {mergeStoryEvents} from './mergeStoryEvents';
import {mergeSaveConfigurations} from './mergeSaveConfigurations';
import {mergeWorldEvents} from './mergeWorldEvents';
import {determineSaveOrder} from './determineSaveOrder';
import {collectEjectedPlayerInventoryIds} from './collectEjectedPlayerInventoryIds';
import {MergedSaveSections} from './MergedSaveSections';
import {SaveSections} from './SaveSections';

/**
 * Merges two Planet Crafter saves section by section.
 * If one save has `planetId === 'Prime'` in its configuration, it is promoted to save A.
 * Every section rule returns structured entries: nothing is serialized here.
 * @param saveDisplayName - Overrides `saveDisplayName` in the merged configuration.
 * @see GR-ORDER-1 in docs/game-rules.md
 */
export function mergeSaveSections(sectionsA: SaveSections, sectionsB: SaveSections, saveDisplayName: string): MergedSaveSections {
  const [mainSave, secondarySave] = determineSaveOrder(sectionsA, sectionsB);

  const ejectedPlayerIds = collectEjectedPlayerInventoryIds(mainSave.players, secondarySave.players, secondarySave.inventories);

  return {
    globalMetadata: mergeGlobalMetadata(mainSave.globalMetadata, secondarySave.globalMetadata),
    terraformationLevels: mergeTerraformationLevels(mainSave.terraformationLevels, secondarySave.terraformationLevels),
    players: mergePlayers(mainSave.players, secondarySave.players),
    worldObjects: mergeWorldObjects(mainSave.worldObjects, secondarySave.worldObjects, ejectedPlayerIds.orphanWorldObjectIds),
    inventories: mergeInventories(mainSave.inventories, secondarySave.inventories, ejectedPlayerIds.orphanInventoryIds),
    statistics: mergeStatistics(mainSave.statistics, secondarySave.statistics),
    mailboxes: mergeMailboxes(mainSave.mailboxes, secondarySave.mailboxes),
    storyEvents: mergeStoryEvents(mainSave.storyEvents, secondarySave.storyEvents),
    saveConfiguration: mergeSaveConfigurations(mainSave.saveConfigurations, secondarySave.saveConfigurations, saveDisplayName),
    worldEvents: mergeWorldEvents(mainSave.worldEvents, secondarySave.worldEvents)
  };
}
