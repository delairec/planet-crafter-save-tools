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
import {MergeWarning} from './MergeWarning';
import {SaveSectionsMerge} from './SaveSectionsMerge';
import {compareGameReleases} from '../../../save/domain/rules/compareGameReleases';
import {SaveSections} from '../../../save/domain/save/SaveSections';

export interface MergeOptions {
  saveDisplayName: string;
  preferLegacyFormat: boolean;
}

export function mergeSaveSections(sectionsA: SaveSections, sectionsB: SaveSections, {saveDisplayName, preferLegacyFormat}: MergeOptions): SaveSectionsMerge {
  const [mainSave, secondarySave] = determineSaveOrder(sectionsA, sectionsB);
  const writtenFormatSave = selectWrittenFormatSave(mainSave, secondarySave, preferLegacyFormat);

  const ejectedPlayerIds = collectEjectedPlayerInventoryIds(mainSave.players, secondarySave.players, secondarySave.inventories);

  const sections: MergedSaveSections = {
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

  if (mainSave.formatRelease === secondarySave.formatRelease) {
    return {sections, warnings: [], legacyFormatCouldBeKept: false};
  }

  const otherFormatSave = writtenFormatSave === mainSave ? secondarySave : mainSave;

  return {
    sections,
    warnings: reportWrittenFormat(sections, otherFormatSave.formatRelease),
    legacyFormatCouldBeKept: !preferLegacyFormat
  };
}

function reportWrittenFormat(sections: MergedSaveSections, otherRelease: string): MergeWarning[] {
  const warnings: MergeWarning[] = [{code: 'merged-save-format', formatRelease: sections.formatRelease}];

  if (sections.terrainLayers === undefined) {
    warnings.push({code: 'merged-save-section-dropped', section: 'terrainLayers'});
  }
  if (compareGameReleases(sections.formatRelease, otherRelease) < 0) {
    warnings.push({code: 'merged-save-content-newer-than-format', formatRelease: sections.formatRelease, contentRelease: otherRelease});
  }

  return warnings;
}
