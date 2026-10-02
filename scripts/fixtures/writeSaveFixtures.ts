import {mkdir, writeFile} from 'node:fs/promises';

export interface SaveFixture {
  fileName: string;
  generateContent: () => string;
}

export async function writeSaveFixtures({directoryPath, fixtures}: {directoryPath: string; fixtures: SaveFixture[]}): Promise<void> {
  await mkdir(directoryPath, {recursive: true});
  for (const {fileName, generateContent} of fixtures) {
    await writeFile(`${directoryPath}/${fileName}`, generateContent());
  }
}
