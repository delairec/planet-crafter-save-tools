import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";
import {assertArray, assertFiniteNumber, assertOptionalString} from "../errors/assertions";

export interface PlanetWorldObjectsValueObject {
  readonly planetId: number;
  readonly planetName?: string;
  readonly placedWorldObjects: readonly PlacedWorldObjectEntity[];
}

export function createPlanetWorldObjectsValueObject(input: PlanetWorldObjectsValueObject): PlanetWorldObjectsValueObject {
  return {
    planetId: assertFiniteNumber(input.planetId, 'PlanetWorldObjectsValueObject.planetId'),
    planetName: assertOptionalString(input.planetName, 'PlanetWorldObjectsValueObject.planetName'),
    placedWorldObjects: assertArray<PlacedWorldObjectEntity>(input.placedWorldObjects, 'PlanetWorldObjectsValueObject.placedWorldObjects')
  };
}
