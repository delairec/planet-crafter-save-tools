import {PlanetNamesReaderPort} from "../application/ports/PlanetNamesReaderPort";

export const PRIME_PLANET_NUMERIC_ID = -1140328421;

const PLANET_NAMES_BY_NUMERIC_ID: Readonly<Record<number, string>> = {[PRIME_PLANET_NUMERIC_ID]: 'Prime'};

export function stubPlanetNamesReader(): PlanetNamesReaderPort {
  return {findPlanetNameOfNumericId: (numericId) => PLANET_NAMES_BY_NUMERIC_ID[numericId]};
}
