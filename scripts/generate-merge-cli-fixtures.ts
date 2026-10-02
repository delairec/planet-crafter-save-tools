import {runAsEntryPointWith} from './runAsEntryPointWith.ts';
import {writeSaveFixtures, type SaveFixture} from './writeSaveFixtures.ts';
import {appendUnreadablePlayerEntry} from './appendUnreadablePlayerEntry.ts';
import {createFakeSaveContent, createLegacyFakeSaveContent} from '../packages/core-mapping/src/save/infrastructure/wireFormat/testing/createFakeSaveContent.js';
import {
  createGlobalMetadata,
  createSaveConfiguration,
  createWorldObject
} from '../packages/core-mapping/src/save/infrastructure/wireFormat/testing/createSaveRecords.js';
import {GLOBAL_METADATA_SECTION_INDEX} from '../packages/core-mapping/src/save/infrastructure/wireFormat/sectionIndexes.js';
import {replaceSaveSection} from '../packages/core-mapping/src/save/infrastructure/wireFormat/replaceSaveSection.js';

const MERGE_CLI_FIXTURES_DIRECTORY = 'packages/cli-merge/testing/fixtures';
const GROUP_UNLOCKED_BY_SAVE_A_ONLY = 'UnlockedFromSaveA';
const GROUP_UNLOCKED_BY_SAVE_B_ONLY = 'UnlockedFromSaveB';
const SKEO_UPDATE_RELEASE = '2.102';
const WORLD_OBJECTS_WITHOUT_DEPRECATED_GROUP_ID = [createWorldObject({id: 15974863, gId: 'Phytoplankton1'})];

function generateContentHoldingTerraTokens(terraTokens: number): string {
  return createFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens, allTimeTerraTokens: terraTokens})});
}

function generateContentUnlockingOnly(unlockedGroup: string): string {
  return createFakeSaveContent({globalMetadata: createGlobalMetadata({unlockedGroups: unlockedGroup})});
}

function generateContentWithoutGlobalMetadata(): string {
  return replaceSaveSection(generateContentHoldingTerraTokens(10), GLOBAL_METADATA_SECTION_INDEX, () => '');
}

function generateContentCarryingDeprecatedGroupIds(): string {
  return createFakeSaveContent({
    worldObjects: [
      createWorldObject({id: 79111656, gId: 'Phytoplankton2'}),
      createWorldObject({id: 79111657, gId: 'Phytoplankton3'})
    ]
  });
}

export const MERGE_CLI_FIXTURES: SaveFixture[] = [
  {fileName: 'terra-tokens-10_valid.json', generateContent: () => generateContentHoldingTerraTokens(10)},
  {fileName: 'terra-tokens-20_valid.json', generateContent: () => generateContentHoldingTerraTokens(20)},
  {
    fileName: 'legacy-format-terra-tokens-10_valid.json',
    generateContent: () => createLegacyFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 10, allTimeTerraTokens: 10})})
  },
  {fileName: 'unreadable-player-entry_invalid.json', generateContent: () => appendUnreadablePlayerEntry(generateContentHoldingTerraTokens(10))},
  {fileName: 'no-global-metadata_invalid.json', generateContent: generateContentWithoutGlobalMetadata},
  {fileName: 'deprecated-group-ids_valid.json', generateContent: generateContentCarryingDeprecatedGroupIds},
  {
    fileName: 'legacy-format-current-group-ids_valid.json',
    generateContent: () => createLegacyFakeSaveContent({worldObjects: WORLD_OBJECTS_WITHOUT_DEPRECATED_GROUP_ID})
  },
  {fileName: 'current-group-ids_valid.json', generateContent: () => createFakeSaveContent({worldObjects: WORLD_OBJECTS_WITHOUT_DEPRECATED_GROUP_ID})},
  {
    fileName: 'release-2-102-current-group-ids_valid.json',
    generateContent: () => createFakeSaveContent({
      saveConfiguration: createSaveConfiguration({version: SKEO_UPDATE_RELEASE}),
      worldObjects: WORLD_OBJECTS_WITHOUT_DEPRECATED_GROUP_ID
    })
  },
  {fileName: 'unlocks-group-a_valid.json', generateContent: () => generateContentUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_A_ONLY)},
  {fileName: 'unlocks-group-b_valid.json', generateContent: () => generateContentUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_B_ONLY)},
  {
    fileName: 'legacy-format-unlocks-group-a_valid.json',
    generateContent: () => createLegacyFakeSaveContent({globalMetadata: createGlobalMetadata({unlockedGroups: GROUP_UNLOCKED_BY_SAVE_A_ONLY})})
  }
];

export function resolveMergeCliFixturePath(fileName: string): string {
  return new URL(`../${MERGE_CLI_FIXTURES_DIRECTORY}/${fileName}`, import.meta.url).pathname;
}

export default async function writeMergeCliFixtures(): Promise<void> {
  await writeSaveFixtures({directoryPath: new URL(`../${MERGE_CLI_FIXTURES_DIRECTORY}`, import.meta.url).pathname, fixtures: MERGE_CLI_FIXTURES});
}

export async function generateMergeCliFixtures(print: (line: string) => void): Promise<void> {
  await writeMergeCliFixtures();
  print(`generate:merge-cli-fixtures: ${MERGE_CLI_FIXTURES.length} fixture(s) written to ${MERGE_CLI_FIXTURES_DIRECTORY}.`);
}

await runAsEntryPointWith(import.meta.main, generateMergeCliFixtures, console.log);
