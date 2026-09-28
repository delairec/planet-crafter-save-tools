import {PlacedWorldObjectEntity} from "../entities/PlacedWorldObjectEntity";

export interface PlanetWorldObjectsValueObject {
  readonly planetId: number;
  readonly planetName?: string;
  readonly placedWorldObjects: readonly PlacedWorldObjectEntity[];
}

export function createPlanetWorldObjectsValueObject(input: PlanetWorldObjectsValueObject): PlanetWorldObjectsValueObject {
  return {
    planetId: input.planetId,
    planetName: input.planetName,
    placedWorldObjects: input.placedWorldObjects
  };
}
