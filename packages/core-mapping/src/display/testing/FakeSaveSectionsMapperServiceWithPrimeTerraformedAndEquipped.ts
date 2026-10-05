import {FakeSaveSectionsMapperService} from "./FakeSaveSectionsMapperService";
import {PRIME_PLANET_NUMERIC_ID} from "./stubPlanetNamesReader";
import {TerraformationLevelEntity} from "../domain/entities/TerraformationLevelEntity";
import {PlacedWorldObjectEntity} from "../domain/entities/PlacedWorldObjectEntity";
import {WorldObjectEntity} from "../domain/entities/WorldObjectEntity";
import {
  createPlanetWorldObjectsValueObject,
  PlanetWorldObjectsValueObject
} from "../domain/valueObjects/PlanetWorldObjectsValueObject";

export const PRIME_TERRAFORMATION_LEVEL = new TerraformationLevelEntity({
  planetId: 'Prime',
  unitOxygenLevel: 1_000,
  unitHeatLevel: 2_000,
  unitPressureLevel: 3_000,
  unitPlantsLevel: 400,
  unitInsectsLevel: 500,
  unitAnimalsLevel: 600,
  unitPurificationLevel: undefined
});

export const PRIME_GENERATOR = new PlacedWorldObjectEntity({id: '1', name: 'EnergyGenerator6' as const, position: [0, 0, 0], planetId: PRIME_PLANET_NUMERIC_ID});
export const PRIME_DRILL = new PlacedWorldObjectEntity({id: '2', name: 'Drill4' as const, position: [10, 0, 0], planetId: PRIME_PLANET_NUMERIC_ID});

export class FakeSaveSectionsMapperServiceWithPrimeTerraformedAndEquipped extends FakeSaveSectionsMapperService {
  override getTerraformationLevels(): TerraformationLevelEntity[] {
    return [PRIME_TERRAFORMATION_LEVEL];
  }

  override getPlacedWorldObjectsByPlanet(): PlanetWorldObjectsValueObject[] {
    return [createPlanetWorldObjectsValueObject({planetId: PRIME_PLANET_NUMERIC_ID, placedWorldObjects: [PRIME_GENERATOR, PRIME_DRILL]})];
  }

  override getWorldObjects(): WorldObjectEntity[] {
    return [PRIME_GENERATOR, PRIME_DRILL];
  }
}
