function resolveScenarioFixturePath(fixtureFileName: string): string {
  return new URL(`../fixtures/${fixtureFileName}`, import.meta.url).pathname;
}

export const baselineSaveFixturePath = resolveScenarioFixturePath('baseline_valid.json');
export const otherPlayerSaveFixturePath = resolveScenarioFixturePath('other-player_valid.json');
export const legacySaveFixturePath = resolveScenarioFixturePath('legacy-format_valid.json');
