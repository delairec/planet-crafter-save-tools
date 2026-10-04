import {describe, expect, it} from 'bun:test';
import {measureEnergyOfEachPlanet} from './measureEnergyOfEachPlanet';
import {PlacedWorldObjectEntity} from '../entities/PlacedWorldObjectEntity';
import {TerraformationLevelEntity} from '../entities/TerraformationLevelEntity';
import {InventoryEntity} from '../entities/InventoryEntity';
import {EnergyLevelsOfRelease} from '../energyLevelsByWorldObjectName';
import {OptimizerRangesByWorldObjectName} from '../valueObjects/OptimizerRangeValueObject';
import {PlanetWorldObjectsValueObject} from '../valueObjects/PlanetWorldObjectsValueObject';
import {PlanetEnergyLevelsValueObject} from '../valueObjects/PlanetEnergyLevelsValueObject';

const SEED_ON_HUMBLE = new PlacedWorldObjectEntity({id: '1', name: 'Seed7Humble' as const, position: [0, 0, 0], planetId: 1});
const GENERATOR_ON_PRIME = new PlacedWorldObjectEntity({id: '2', name: 'EnergyGenerator1' as const, position: [0, 0, 0], planetId: 2});

const HUMBLE_TERRAFORMATION_LEVEL = new TerraformationLevelEntity({
  planetId: 'Humble',
  unitOxygenLevel: 0,
  unitHeatLevel: 0,
  unitPressureLevel: 0,
  unitPlantsLevel: 0,
  unitInsectsLevel: 0,
  unitAnimalsLevel: 0,
  unitPurificationLevel: undefined
});

const NO_INVENTORIES: readonly InventoryEntity[] = [];
const NO_ENERGY_LEVELS: EnergyLevelsOfRelease = {release: '2.103', production: {}, consumption: {}};
const NO_OPTIMIZER_RANGES: OptimizerRangesByWorldObjectName = {};
const UNMODIFIED_POWER_CONSUMPTION = 1;

interface SavePlanets {
  readonly planet: PlanetWorldObjectsValueObject;
  readonly terraformationLevels: readonly TerraformationLevelEntity[];
  readonly findPlanetNameOfNumericId: (numericId: number) => string | undefined;
}

function measurePlanetsOfSave({planet, terraformationLevels, findPlanetNameOfNumericId}: SavePlanets): PlanetEnergyLevelsValueObject[] {
  return measureEnergyOfEachPlanet({
    planets: [planet],
    terraformationLevels,
    findPlanetNameOfNumericId,
    allWorldObjects: planet.placedWorldObjects,
    inventories: NO_INVENTORIES,
    energyLevels: NO_ENERGY_LEVELS,
    optimizerRanges: NO_OPTIMIZER_RANGES,
    powerConsumptionModifier: UNMODIFIED_POWER_CONSUMPTION
  });
}

describe('measureEnergyOfEachPlanet', () => {
  describe('When the planet names table has no name for the numeric identifier of a planet', () => {
    it('should measure the planet under the terraformed planet name its world objects carry', () => {
      // Arrange
      const planetsNamedByNoTable = (): undefined => undefined;

      // Act
      const [planet] = measurePlanetsOfSave({planet: {planetId: 1, placedWorldObjects: [SEED_ON_HUMBLE]}, terraformationLevels: [HUMBLE_TERRAFORMATION_LEVEL], findPlanetNameOfNumericId: planetsNamedByNoTable});

      // Assert
      expect(planet?.planetName).toBe('Humble');
    });
  });

  describe('When the planet names table names the numeric identifier of a planet', () => {
    it('should measure the planet under that name', () => {
      // Arrange
      const noTerraformedPlanet: TerraformationLevelEntity[] = [];
      const primeNamedByTheTable = (): string => 'Prime';

      // Act
      const [planet] = measurePlanetsOfSave({planet: {planetId: 2, placedWorldObjects: [GENERATOR_ON_PRIME]}, terraformationLevels: noTerraformedPlanet, findPlanetNameOfNumericId: primeNamedByTheTable});

      // Assert
      expect(planet?.planetName).toBe('Prime');
    });
  });
});
