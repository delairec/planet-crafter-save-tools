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
import {selectWrittenFormatSave} from './selectWrittenFormatSave';
import {mergeTerrainLayers} from './mergeTerrainLayers';
import {MergedSaveSections} from './MergedSaveSections';
import {SaveSections} from '../../save/SaveSections';

export interface MergeOptions {
  saveDisplayName: string;
  preferLegacyFormat: boolean;
}

/**
 * @see @RULE.TheSaveOnPrimeBecomesSaveA
 */
export function mergeSaveSections(sectionsA: SaveSections, sectionsB: SaveSections, {saveDisplayName, preferLegacyFormat}: MergeOptions): MergedSaveSections {
  const [mainSave, secondarySave] = determineSaveOrder(sectionsA, sectionsB);
  const writtenFormatSave = selectWrittenFormatSave(mainSave, secondarySave, preferLegacyFormat);

  const ejectedPlayerIds = collectEjectedPlayerInventoryIds(mainSave.players, secondarySave.players, secondarySave.inventories);

  return {
    formatRelease: writtenFormatSave.formatRelease,
    globalMetadata: mergeGlobalMetadata(mainSave.globalMetadata, secondarySave.globalMetadata),
    terraformationLevels: mergeTerraformationLevels(mainSave.terraformationLevels, secondarySave.terraformationLevels),
    players: mergePlayers(mainSave.players, secondarySave.players),
    worldObjects: mergeWorldObjects(mainSave.worldObjects, secondarySave.worldObjects, ejectedPlayerIds.orphanWorldObjectIds),
    inventories: mergeInventories(mainSave.inventories, secondarySave.inventories, ejectedPlayerIds.orphanInventoryIds),
    statistics: mergeStatistics(mainSave.statistics, secondarySave.statistics),
    mailboxes: mergeMailboxes(mainSave.mailboxes, secondarySave.mailboxes),
    storyEvents: mergeStoryEvents(mainSave.storyEvents, secondarySave.storyEvents),
    saveConfiguration: mergeSaveConfigurations(mainSave.saveConfigurations, secondarySave.saveConfigurations, {
      saveDisplayName,
      declaredVersion: writtenFormatSave.saveConfigurations[0]?.version
    }),
    terrainLayers: mergeTerrainLayers(mainSave, secondarySave, writtenFormatSave),
    worldEvents: mergeWorldEvents(mainSave.worldEvents, secondarySave.worldEvents)
  };
}
