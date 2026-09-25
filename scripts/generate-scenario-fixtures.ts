import {writeFile} from 'node:fs/promises';
import {createFakeSaveContent, createLegacyFakeSaveContent} from '../packages/shared-save-processing/testing/createFakeSaveContent.js';
import {
  createEquipment,
  createGlobalMetadata,
  createInventory,
  createPlayer,
  createSaveConfiguration,
  createWorldObject
} from '../packages/shared-save-processing/testing/createSaveRecords.js';

const SCENARIO_FIXTURES_DIRECTORY = 'packages/ui-save-manager/e2e/fixtures';

interface ScenarioFixture {
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

const SCENARIO_FIXTURES: ScenarioFixture[] = [
  {fileName: 'baseline_valid.json', generateContent: () => createFakeSaveContent()},
  {fileName: 'other-player_valid.json', generateContent: generateOtherPlayerContent},
  {fileName: 'negative-gauge_invalid.json', generateContent: () => createFakeSaveContent({players: [createPlayer({playerGaugeToxic: -1})]})},
  {fileName: 'legacy-format_valid.json', generateContent: () => createLegacyFakeSaveContent()},
  {fileName: 'skeo-update_valid.json', generateContent: generateSkeoUpdateContent}
];

function resolveScenarioFixturePath(fileName: string): string {
  return new URL(`../${SCENARIO_FIXTURES_DIRECTORY}/${fileName}`, import.meta.url).pathname;
}

export default async function writeScenarioFixtures(): Promise<void> {
  for (const {fileName, generateContent} of SCENARIO_FIXTURES) {
    await writeFile(resolveScenarioFixturePath(fileName), generateContent());
  }
}

if (import.meta.main) {
  await writeScenarioFixtures();
  console.log(`generate:scenario-fixtures: ${SCENARIO_FIXTURES.length} fixture(s) written to ${SCENARIO_FIXTURES_DIRECTORY}.`);
}
