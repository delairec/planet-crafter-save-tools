import {SAVE_CONFIGURATION_SECTION_INDEX} from 'shared-save-processing/sectionIndexes.js';
import {DecodedSections} from './DecodedSections';

const PRIME_PLANET_ID = 'Prime';

/**
 * @see GR-ORDER-1 in docs/game-rules.md
 */
export function determineSaveOrder(parsedSaveA: DecodedSections, parsedSaveB: DecodedSections): [DecodedSections, DecodedSections] {
  if (!isPrimePlanetSave(parsedSaveA) && isPrimePlanetSave(parsedSaveB)) {
    return [parsedSaveB, parsedSaveA];
  }

  return [parsedSaveA, parsedSaveB];
}

function isPrimePlanetSave(parsedSave: DecodedSections): boolean {
  return parsedSave[SAVE_CONFIGURATION_SECTION_INDEX]?.[0]?.planetId === PRIME_PLANET_ID;
}
