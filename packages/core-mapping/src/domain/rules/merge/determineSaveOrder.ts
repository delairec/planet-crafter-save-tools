import {SaveSections} from '../../save/SaveSections';

const PRIME_PLANET_ID = 'Prime';

/**
 * @see @RULE.TheSaveOnPrimeBecomesSaveA
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
