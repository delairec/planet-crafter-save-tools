import {selectPlanetNameOfNumericId} from "data-planets/selectPlanetNameOfNumericId";
import {PlanetNamesReaderPort} from "../application/ports/PlanetNamesReaderPort";

export class PlanetNamesReaderService implements PlanetNamesReaderPort {
  findPlanetNameOfNumericId(numericId: number): string | undefined {
    return selectPlanetNameOfNumericId(numericId);
  }
}
