import type {ParsedSave} from 'shared-save-processing/gameDefinitions';
import {mergeGlobalMetadata} from './mergeGlobalMetadata.ts';
import {mergeTerraformationLevels} from './mergeTerraformationLevels.ts';
import {mergePlayers} from './mergePlayers.ts';
import {mergeWorldObjects} from './mergeWorldObjects.ts';
import {mergeInventories} from './mergeInventories.ts';
import {mergeStatistics} from './mergeStatistics.ts';
import {mergeMailboxes} from './mergeMailboxes.ts';
import {mergeStoryEvents} from './mergeStoryEvents.ts';
import {mergeSaveConfigurations} from './mergeSaveConfigurations.ts';
import {mergeWorldEvents} from './mergeWorldEvents.ts';
import {determineSaveOrder} from './determineSaveOrder.ts';
import {collectEjectedPlayerInventoryIds} from './collectEjectedPlayerInventoryIds.ts';

function* EMPTY_GENERATOR(): Generator<never> {
}

export interface MergeParsedSaveSectionsResult {
  mergeSaves: () => string;
  saveAWorldObjectIds: Set<number>;
  indexFileA: number;
  indexFileB: number;
}

/**
 * Merges two Planet Crafter save strings section by section.
 * If one save has `planetId === 'Prime'` in its configuration, it is promoted to save A.
 * @param saveDisplayName - Overrides `saveDisplayName` in the merged configuration.
 * @see GR-ORDER-1 in docs/business-rules.md
 */
export function mergeParsedSaveSections(saveA: ParsedSave, saveB: ParsedSave, saveDisplayName: string): MergeParsedSaveSectionsResult {
    if (!Array.isArray(saveA.sections) && !Array.isArray(saveB.sections)) {
        throw Error('ERROR_INVALID_INPUT_FORMAT');
    }

    const [mainSave, secondarySave] = determineSaveOrder(saveA.sections, saveB.sections);

    const [metadataA = [], terraformationLevelsA = [], playersA = [], worldObjectsFactoryA = () => EMPTY_GENERATOR(), inventoriesA = [], statisticsA = [], mailboxA = [], storyEventsA = [], saveConfigurationsA = [], worldEventsA = []] = mainSave;
    const [metadataB = [], terraformationLevelsB = [], playersB = [], worldObjectsFactoryB = () => EMPTY_GENERATOR(), inventoriesB = [], statisticsB = [], mailboxB = [], storyEventsB = [], saveConfigurationsB = [], worldEventsB = []] = secondarySave;

    const saveAWorldObjectIds = new Set<number>();

    function mergeSaves(): string {
        const ejectedPlayerIds = collectEjectedPlayerInventoryIds(playersA, playersB, inventoriesB);

        const {
            serialized: serializedWorldObjects,
            saveAWorldObjectIds: collectedIds
        } = mergeWorldObjects(worldObjectsFactoryA(), worldObjectsFactoryB(), ejectedPlayerIds.orphanWorldObjectIds);
        for (const id of collectedIds) saveAWorldObjectIds.add(id);

        const sections = [
            mergeGlobalMetadata(metadataA, metadataB),
            mergeTerraformationLevels(terraformationLevelsA, terraformationLevelsB),
            mergePlayers(playersA, playersB),
            serializedWorldObjects,
            mergeInventories(inventoriesA, inventoriesB, ejectedPlayerIds.orphanInventoryIds),
            mergeStatistics(statisticsA, statisticsB),
            mergeMailboxes(mailboxA, mailboxB),
            mergeStoryEvents(storyEventsA, storyEventsB),
            mergeSaveConfigurations(saveConfigurationsA, saveConfigurationsB, saveDisplayName),
            mergeWorldEvents(worldEventsA, worldEventsB)
        ];

        return sections.join('\n@\n') + '\n@';
    }

    return {
        mergeSaves,
        saveAWorldObjectIds,
        indexFileA: mainSave === saveA.sections ? 0 : 1,
        indexFileB: secondarySave === saveB.sections ? 1 : 0
    };
}
