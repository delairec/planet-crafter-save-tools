import {createPlanetWorldObjectsValueObject, PlanetWorldObjectsValueObject} from "../valueObjects/PlanetWorldObjectsValueObject";
import {resolvePlanetName} from "./resolvePlanetName";

export function namePlanet(planet: PlanetWorldObjectsValueObject, planetNameOfNumericId: string | undefined, knownPlanetNames: string[]): PlanetWorldObjectsValueObject {
  return createPlanetWorldObjectsValueObject({
    ...planet,
    planetName: resolvePlanetName(
      planetNameOfNumericId,
      planet.placedWorldObjects.map((placedWorldObject) => placedWorldObject.name),
      knownPlanetNames
    )
  });
}
