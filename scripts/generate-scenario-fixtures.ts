import {mkdir, writeFile} from 'node:fs/promises';
import {runAsEntryPointWith} from './runAsEntryPointWith.ts';
import {createFakeSaveContent, createLegacyFakeSaveContent} from '../packages/core-mapping/src/save/infrastructure/wireFormat/testing/createFakeSaveContent.js';
import {
  createEquipment,
  createGlobalMetadata,
  createInventory,
  createPlayer,
  createSaveConfiguration,
  createWorldObject
} from '../packages/core-mapping/src/save/infrastructure/wireFormat/testing/createSaveRecords.js';
import {GLOBAL_METADATA_SECTION_INDEX, PLAYERS_SECTION_INDEX} from '../packages/core-mapping/src/save/infrastructure/wireFormat/sectionIndexes.js';
import {replaceSaveSection} from '../packages/core-mapping/src/save/infrastructure/wireFormat/replaceSaveSection.js';

const UI_SCENARIOS_DIRECTORY = 'packages/ui-save-manager/e2e/fixtures';
const MERGE_CLI_SPECS_DIRECTORY = 'packages/cli-merge/testing/fixtures';
const VALIDATE_CLI_SPECS_DIRECTORY = 'packages/cli-validate/testing/fixtures';

interface ScenarioFixture {
  directory: string;
  fileName: string;
  generateContent: () => string;
}

function generateOtherPlayerContent(): string {
  return createFakeSaveContent({
    globalMetadata: createGlobalMetadata({terraTokens: 250, allTimeTerraTokens: 310_456, unlockedGroups: 'BootsSpeed2'}),
    players: [createPlayer({id: '76561190000000007', name: 'Sakia', inventoryId: 144, equipmentId: 145})],
    inventories: [
      createInventory({id: 144, woIds: '31000001,31000002'}),
      createEquipment({id: 145, woIds: '31000003,31000004'})
    ],
    worldObjects: [
      createWorldObject({id: 31000001, gId: 'Phytoplankton2'}),
      createWorldObject({id: 31000002, gId: 'NeptunQuartz'}),
      createWorldObject({id: 31000003, gId: 'Backpack5'}),
      createWorldObject({id: 31000004, gId: 'OxygenTank3'}),
      createWorldObject({id: 31000005, gId: 'WindTurbine1', pos: '20,0,0', planet: 1}),
      createWorldObject({id: 31000006, gId: 'Heater2', pos: '21,0,0', planet: 1})
    ],
    saveConfiguration: createSaveConfiguration({saveDisplayName: 'Companion Save', worldSeed: 77})
  });
}

const SKEO_PLANET_NUMERIC_ID = -440810600;
const SKEO_UPDATE_RELEASE = '2.102';

function generateSkeoUpdateContent(): string {
  return createFakeSaveContent({
    globalMetadata: createGlobalMetadata({logisticsPaused: true}),
    saveConfiguration: createSaveConfiguration({version: SKEO_UPDATE_RELEASE}),
    inventories: [createInventory(), createEquipment()],
    worldObjects: [
      createWorldObject({id: 79111656, gId: 'Phytoplankton'}),
      createWorldObject({id: 58524136, gId: 'MagnetarQuartz'}),
      createWorldObject({id: 85274195, gId: 'Backpack4'}),
      createWorldObject({id: 48456321, gId: 'OxygenTank5'}),
      createWorldObject({id: 95585250, gId: 'WindTurbine1', pos: '0,0,0', planet: SKEO_PLANET_NUMERIC_ID})
    ]
  });
}

const TOXICITY_PLANET_NUMERIC_ID = 110910045;
const MEASURED_GAME_RELEASE = '2.103';
const ENERGY_FUSE_OPTIMIZER_INVENTORY_ID = 244;
const OTHER_FUSE_OPTIMIZER_INVENTORY_ID = 245;

function generateEnergyConsumptionContent(): string {
  const placedOnToxicity = (id: number, gId: string, eastOffset: number, liId?: number) => createWorldObject({
    id,
    gId,
    pos: `${1751.865 + eastOffset},472.58,-1106.104`,
    rot: '0,0,0,1',
    planet: TOXICITY_PLANET_NUMERIC_ID,
    ...(liId === undefined ? {} : {liId})
  });

  return createFakeSaveContent({
    saveConfiguration: createSaveConfiguration({version: MEASURED_GAME_RELEASE, modifierPowerConsumption: 1.0}),
    inventories: [
      createInventory(),
      createEquipment(),
      createInventory({id: ENERGY_FUSE_OPTIMIZER_INVENTORY_ID, woIds: '41000101', size: 1}),
      createInventory({id: OTHER_FUSE_OPTIMIZER_INVENTORY_ID, woIds: '41000102', size: 3})
    ],
    worldObjects: [
      createWorldObject({id: 79111656, gId: 'Phytoplankton'}),
      createWorldObject({id: 58524136, gId: 'MagnetarQuartz'}),
      createWorldObject({id: 85274195, gId: 'Backpack4'}),
      createWorldObject({id: 48456321, gId: 'OxygenTank5'}),
      createWorldObject({id: 41000101, gId: 'FuseEnergy1'}),
      createWorldObject({id: 41000102, gId: 'FuseProduction1'}),
      placedOnToxicity(41000001, 'EnergyGenerator5', 5),
      placedOnToxicity(41000002, 'TreePlanter3', 10),
      placedOnToxicity(41000003, 'ButterflyDisplayer1', 15),
      placedOnToxicity(41000004, 'FishDisplayer1', 20),
      placedOnToxicity(41000005, 'FrogDisplayer1', 25),
      placedOnToxicity(41000006, 'Server1', 30),
      placedOnToxicity(41000007, 'CookingStation1', 35),
      placedOnToxicity(41000008, 'PodUnderground', 40),
      placedOnToxicity(41000009, 'RocketAnimals2', 45),
      placedOnToxicity(41000010, 'Optimizer1', -5, ENERGY_FUSE_OPTIMIZER_INVENTORY_ID),
      placedOnToxicity(41000011, 'Optimizer2', -10, OTHER_FUSE_OPTIMIZER_INVENTORY_ID)
    ]
  });
}

const UNREADABLE_ENTRY = '{ broken entry';
const GROUP_UNLOCKED_BY_SAVE_A_ONLY = 'UnlockedFromSaveA';
const GROUP_UNLOCKED_BY_SAVE_B_ONLY = 'UnlockedFromSaveB';
const WORLD_OBJECTS_WITHOUT_DEPRECATED_GROUP_ID = [createWorldObject({id: 15974863, gId: 'Phytoplankton1'})];

function generateContentHoldingTerraTokens(terraTokens: number): string {
  return createFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens, allTimeTerraTokens: terraTokens})});
}

function generateContentUnlockingOnly(unlockedGroup: string): string {
  return createFakeSaveContent({globalMetadata: createGlobalMetadata({unlockedGroups: unlockedGroup})});
}

function appendUnreadablePlayerEntry(saveContent: string): string {
  return replaceSaveSection(saveContent, PLAYERS_SECTION_INDEX, (currentSection: string) => `${currentSection}|\n${UNREADABLE_ENTRY}`);
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

export const SCENARIO_FIXTURES: ScenarioFixture[] = [
  {directory: UI_SCENARIOS_DIRECTORY, fileName: 'baseline_valid.json', generateContent: () => createFakeSaveContent()},
  {directory: UI_SCENARIOS_DIRECTORY, fileName: 'other-player_valid.json', generateContent: generateOtherPlayerContent},
  {directory: UI_SCENARIOS_DIRECTORY, fileName: 'negative-gauge_invalid.json', generateContent: () => createFakeSaveContent({players: [createPlayer({playerGaugeToxic: -1})]})},
  {directory: UI_SCENARIOS_DIRECTORY, fileName: 'legacy-format_valid.json', generateContent: () => createLegacyFakeSaveContent()},
  {directory: UI_SCENARIOS_DIRECTORY, fileName: 'skeo-update_valid.json', generateContent: generateSkeoUpdateContent},
  {directory: UI_SCENARIOS_DIRECTORY, fileName: 'energy-consumption_valid.json', generateContent: generateEnergyConsumptionContent},
  {directory: MERGE_CLI_SPECS_DIRECTORY, fileName: 'terra-tokens-10_valid.json', generateContent: () => generateContentHoldingTerraTokens(10)},
  {directory: MERGE_CLI_SPECS_DIRECTORY, fileName: 'terra-tokens-20_valid.json', generateContent: () => generateContentHoldingTerraTokens(20)},
  {
    directory: MERGE_CLI_SPECS_DIRECTORY,
    fileName: 'legacy-format-terra-tokens-10_valid.json',
    generateContent: () => createLegacyFakeSaveContent({globalMetadata: createGlobalMetadata({terraTokens: 10, allTimeTerraTokens: 10})})
  },
  {
    directory: MERGE_CLI_SPECS_DIRECTORY,
    fileName: 'unreadable-player-entry_invalid.json',
    generateContent: () => appendUnreadablePlayerEntry(generateContentHoldingTerraTokens(10))
  },
  {directory: MERGE_CLI_SPECS_DIRECTORY, fileName: 'no-global-metadata_invalid.json', generateContent: generateContentWithoutGlobalMetadata},
  {directory: MERGE_CLI_SPECS_DIRECTORY, fileName: 'deprecated-group-ids_valid.json', generateContent: generateContentCarryingDeprecatedGroupIds},
  {
    directory: MERGE_CLI_SPECS_DIRECTORY,
    fileName: 'legacy-format-current-group-ids_valid.json',
    generateContent: () => createLegacyFakeSaveContent({worldObjects: WORLD_OBJECTS_WITHOUT_DEPRECATED_GROUP_ID})
  },
  {
    directory: MERGE_CLI_SPECS_DIRECTORY,
    fileName: 'current-group-ids_valid.json',
    generateContent: () => createFakeSaveContent({worldObjects: WORLD_OBJECTS_WITHOUT_DEPRECATED_GROUP_ID})
  },
  {
    directory: MERGE_CLI_SPECS_DIRECTORY,
    fileName: 'release-2-102-current-group-ids_valid.json',
    generateContent: () => createFakeSaveContent({
      saveConfiguration: createSaveConfiguration({version: SKEO_UPDATE_RELEASE}),
      worldObjects: WORLD_OBJECTS_WITHOUT_DEPRECATED_GROUP_ID
    })
  },
  {directory: MERGE_CLI_SPECS_DIRECTORY, fileName: 'unlocks-group-a_valid.json', generateContent: () => generateContentUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_A_ONLY)},
  {directory: MERGE_CLI_SPECS_DIRECTORY, fileName: 'unlocks-group-b_valid.json', generateContent: () => generateContentUnlockingOnly(GROUP_UNLOCKED_BY_SAVE_B_ONLY)},
  {
    directory: MERGE_CLI_SPECS_DIRECTORY,
    fileName: 'legacy-format-unlocks-group-a_valid.json',
    generateContent: () => createLegacyFakeSaveContent({globalMetadata: createGlobalMetadata({unlockedGroups: GROUP_UNLOCKED_BY_SAVE_A_ONLY})})
  },
  {directory: VALIDATE_CLI_SPECS_DIRECTORY, fileName: 'baseline_valid.json', generateContent: () => createFakeSaveContent()},
  {directory: VALIDATE_CLI_SPECS_DIRECTORY, fileName: 'unreadable-player-entry_invalid.json', generateContent: () => appendUnreadablePlayerEntry(createFakeSaveContent())},
  {directory: VALIDATE_CLI_SPECS_DIRECTORY, fileName: 'legacy-format_valid.json', generateContent: () => createLegacyFakeSaveContent()}
];

const FIXTURE_DIRECTORIES = [UI_SCENARIOS_DIRECTORY, MERGE_CLI_SPECS_DIRECTORY, VALIDATE_CLI_SPECS_DIRECTORY];

export function resolveScenarioFixturePath({directory, fileName}: {directory: string; fileName: string}): string {
  return new URL(`../${directory}/${fileName}`, import.meta.url).pathname;
}

export default async function writeScenarioFixtures(): Promise<void> {
  for (const directory of FIXTURE_DIRECTORIES) {
    await mkdir(new URL(`../${directory}`, import.meta.url).pathname, {recursive: true});
  }
  for (const fixture of SCENARIO_FIXTURES) {
    await writeFile(resolveScenarioFixturePath(fixture), fixture.generateContent());
  }
}

export async function generateScenarioFixtures(print: (line: string) => void): Promise<void> {
  await writeScenarioFixtures();
  print(`generate:scenario-fixtures: ${SCENARIO_FIXTURES.length} fixture(s) written to ${FIXTURE_DIRECTORIES.join(', ')}.`);
}

await runAsEntryPointWith(import.meta.main, generateScenarioFixtures, console.log);
