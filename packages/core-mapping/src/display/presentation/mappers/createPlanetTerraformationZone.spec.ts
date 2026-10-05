import {describe, expect, it} from 'bun:test';
import {createPlanetTerraformationZone} from "./createPlanetTerraformationZone";
import {PlanetTerraformationResponse} from "../../application/responses/TerraformationPageResponse";
import {
  PlanetTerraformationZoneViewModel,
  TerraformationHeroFigureViewModel,
  TerraformationLevelsTableViewModel
} from "../viewModels/PlanetTerraformationZoneViewModel";

const nbsp = ' ';
const PRIME_AMONG_THREE_FACTORS: PlanetTerraformationResponse = {
  levels: {
    planetId: 'Prime',
    unitOxygenLevel: 400_000,
    unitHeatLevel: 100_000,
    unitPressureLevel: 0,
    unitPlantsLevel: 800,
    unitInsectsLevel: 200,
    unitAnimalsLevel: 0,
    unitPurificationLevel: 300_000,
    terraformationIndex: 801_000,
    biomass: 1_000
  },
  systemTerraformationIndex: {index: 4.369e54, planetCount: 3}
};
const AQUALIS_AT_ZERO: PlanetTerraformationResponse = {
  levels: {
    planetId: 'Aqualis',
    unitOxygenLevel: 0,
    unitHeatLevel: 0,
    unitPressureLevel: 0,
    unitPlantsLevel: 0,
    unitInsectsLevel: 0,
    unitAnimalsLevel: 0,
    unitPurificationLevel: undefined,
    terraformationIndex: 0,
    biomass: 0
  }
};

describe('createPlanetTerraformationZone', () => {
  it('should present the hero figures of the planet, then its environmental and organic levels, each row with its bar', () => {
    // Act
    const zone = createPlanetTerraformationZone(PRIME_AMONG_THREE_FACTORS);

    // Assert
    expect<PlanetTerraformationZoneViewModel>(zone).toEqual({
      planetName: 'Prime',
      terraformationIndex: {value: `801${nbsp}kTi`, caption: `Terraformation Index · factor of the 4.369${nbsp}SpdSysTi multiplied over 3 planets`},
      biomass: {value: `1${nbsp}kg`, caption: 'Biomass · plants 80%, insects 20%'},
      environmentalLevels: {
        title: 'Terraformation Index',
        figure: `801${nbsp}kTi`,
        rows: [
          {label: 'O²', value: `400${nbsp}ppt`, barWidthPercentage: 100},
          {label: 'Heat', value: `100${nbsp}nK`, barWidthPercentage: 25},
          {label: 'Pressure', value: '—', barWidthPercentage: 0},
          {label: 'Purification', value: `300${nbsp}kPu`, barWidthPercentage: 75}
        ]
      },
      organicLevels: {
        title: 'Biomass',
        figure: `1${nbsp}kg`,
        rows: [
          {label: 'Plants', value: `800${nbsp}g`, barWidthPercentage: 100},
          {label: 'Insects', value: `200${nbsp}g`, barWidthPercentage: 25},
          {label: 'Animals', value: '—', barWidthPercentage: 0}
        ]
      }
    });
  });

  describe('When the planet is the single factor of the SysTi', () => {
    it('should caption its Terraformation Index with the SysTi multiplied over one planet', () => {
      // Arrange
      const planet: PlanetTerraformationResponse = {
        ...PRIME_AMONG_THREE_FACTORS,
        systemTerraformationIndex: {index: 801_000, planetCount: 1}
      };

      // Act
      const zone = createPlanetTerraformationZone(planet);

      // Assert
      expect<TerraformationHeroFigureViewModel>(zone.terraformationIndex).toEqual({
        value: `801${nbsp}kTi`,
        caption: `Terraformation Index · factor of the 801${nbsp}kSysTi multiplied over 1 planet`
      });
    });
  });

  describe('When the planet does not handle purification', () => {
    it('should leave the purification row out of its environmental levels', () => {
      // Arrange
      const planet: PlanetTerraformationResponse = {
        ...PRIME_AMONG_THREE_FACTORS,
        levels: {...PRIME_AMONG_THREE_FACTORS.levels, unitPurificationLevel: undefined, terraformationIndex: 501_000}
      };

      // Act
      const zone = createPlanetTerraformationZone(planet);

      // Assert
      expect<TerraformationLevelsTableViewModel>(zone.environmentalLevels).toEqual({
        title: 'Terraformation Index',
        figure: `501${nbsp}kTi`,
        rows: [
          {label: 'O²', value: `400${nbsp}ppt`, barWidthPercentage: 100},
          {label: 'Heat', value: `100${nbsp}nK`, barWidthPercentage: 25},
          {label: 'Pressure', value: '—', barWidthPercentage: 0}
        ]
      });
    });
  });

  describe('When the Terraformation Index of the planet is zero', () => {
    it('should caption its Terraformation Index without a SysTi it does not multiply', () => {
      // Act
      const zone = createPlanetTerraformationZone(AQUALIS_AT_ZERO);

      // Assert
      expect<TerraformationHeroFigureViewModel>(zone.terraformationIndex).toEqual({value: `0${nbsp}Ti`, caption: 'Terraformation Index'});
    });

    it('should caption its biomass without the shares of plants and insects', () => {
      // Act
      const zone = createPlanetTerraformationZone(AQUALIS_AT_ZERO);

      // Assert
      expect<TerraformationHeroFigureViewModel>(zone.biomass).toEqual({value: `0${nbsp}g`, caption: 'Biomass'});
    });

    it('should show a dash and an empty bar on every row of a table', () => {
      // Act
      const zone = createPlanetTerraformationZone(AQUALIS_AT_ZERO);

      // Assert
      expect<TerraformationLevelsTableViewModel>(zone.organicLevels).toEqual({
        title: 'Biomass',
        figure: `0${nbsp}g`,
        rows: [
          {label: 'Plants', value: '—', barWidthPercentage: 0},
          {label: 'Insects', value: '—', barWidthPercentage: 0},
          {label: 'Animals', value: '—', barWidthPercentage: 0}
        ]
      });
    });
  });
});
