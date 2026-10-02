import {runAsEntryPointWith} from './runAsEntryPointWith.ts';
import {writeSaveFixtures, type SaveFixture} from './writeSaveFixtures.ts';
import {appendUnreadablePlayerEntry} from './appendUnreadablePlayerEntry.ts';
import {createFakeSaveContent, createLegacyFakeSaveContent} from '../packages/core-mapping/src/save/infrastructure/wireFormat/testing/createFakeSaveContent.js';

const VALIDATE_CLI_FIXTURES_DIRECTORY = 'packages/cli-validate/testing/fixtures';

export const VALIDATE_CLI_FIXTURES: SaveFixture[] = [
  {fileName: 'baseline_valid.json', generateContent: () => createFakeSaveContent()},
  {fileName: 'unreadable-player-entry_invalid.json', generateContent: () => appendUnreadablePlayerEntry(createFakeSaveContent())},
  {fileName: 'legacy-format_valid.json', generateContent: () => createLegacyFakeSaveContent()}
];

export function resolveValidateCliFixturePath(fileName: string): string {
  return new URL(`../${VALIDATE_CLI_FIXTURES_DIRECTORY}/${fileName}`, import.meta.url).pathname;
}

export default async function writeValidateCliFixtures(): Promise<void> {
  await writeSaveFixtures({directoryPath: new URL(`../${VALIDATE_CLI_FIXTURES_DIRECTORY}`, import.meta.url).pathname, fixtures: VALIDATE_CLI_FIXTURES});
}

export async function generateValidateCliFixtures(print: (line: string) => void): Promise<void> {
  await writeValidateCliFixtures();
  print(`generate:validate-cli-fixtures: ${VALIDATE_CLI_FIXTURES.length} fixture(s) written to ${VALIDATE_CLI_FIXTURES_DIRECTORY}.`);
}

await runAsEntryPointWith(import.meta.main, generateValidateCliFixtures, console.log);
