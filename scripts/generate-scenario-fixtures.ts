import {createFakeSaveContent, createLegacyFakeSaveContent} from '../packages/shared-save-processing/testing/createFakeSaveContent.js';
import {
  createEquipment,
  createGlobalMetadata,
  createInventory,
  createPlayer,
  createSaveConfiguration,
  createWorldObject
} from '../packages/shared-save-processing/testing/createSaveRecords.js';

export const SCENARIO_FIXTURES_DIRECTORY = 'packages/ui-save-manager/e2e/fixtures';

export interface ScenarioFixture {
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
      createWorldObject({id: 31000005, gId: 'WindTurbine2', pos: '20,0,0', planet: 1}),
      createWorldObject({id: 31000006, gId: 'Heater2', pos: '21,0,0', planet: 1})
    ],
    saveConfiguration: createSaveConfiguration({saveDisplayName: 'Companion Save', worldSeed: 77})
  });
}

export const SCENARIO_FIXTURES: ScenarioFixture[] = [
  {fileName: 'baseline_valid.json', generateContent: () => createFakeSaveContent()},
  {fileName: 'other-player_valid.json', generateContent: generateOtherPlayerContent},
  {fileName: 'negative-gauge_invalid.json', generateContent: () => createFakeSaveContent({players: [createPlayer({playerGaugeToxic: -1})]})},
  {fileName: 'legacy-format_valid.json', generateContent: () => createLegacyFakeSaveContent()}
];

/**
 * @param {string} fileName the name of a declared scenario fixture
 * @returns where that fixture is written, resolved from this script rather than from the caller's
 * working directory
 */
export function resolveScenarioFixturePath(fileName: string): string {
  return new URL(`../${SCENARIO_FIXTURES_DIRECTORY}/${fileName}`, import.meta.url).pathname;
}

async function writeScenarioFixtures(): Promise<number> {
  for (const {fileName, generateContent} of SCENARIO_FIXTURES) {
    await Bun.write(resolveScenarioFixturePath(fileName), generateContent());
    console.log(`${SCENARIO_FIXTURES_DIRECTORY}/${fileName}`);
  }
  console.log(`generate:scenario-fixtures: ${SCENARIO_FIXTURES.length} fixture(s) written.`);

  return 0;
}

if (import.meta.main) {
  process.exit(await writeScenarioFixtures());
}
