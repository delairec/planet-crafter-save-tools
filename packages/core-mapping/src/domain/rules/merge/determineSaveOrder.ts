import {SaveSections} from './SaveSections';

const PRIME_PLANET_ID = 'Prime';

/**
 * @see GR-ORDER-1 in docs/game-rules.md
 */
export function determineSaveOrder(saveA: SaveSections, saveB: SaveSections): [SaveSections, SaveSections] {
  if (!isPrimePlanetSave(saveA) && isPrimePlanetSave(saveB)) {
    return [saveB, saveA];
  }

  return [saveA, saveB];
}

function isPrimePlanetSave(save: SaveSections): boolean {
  return save.saveConfigurations[0]?.planetId === PRIME_PLANET_ID;
}
