import {describe, expect, it} from 'bun:test';
import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {WORLD_OBJECTS_SECTION} from "../../save/testing/saveSectionLocations";
import {PlanetEnergyLevelsResponse} from "../application/responses/EnergyLevelsResponse";
import {PlanetTerraformationResponse} from "../application/responses/TerraformationPageResponse";
import {PlanetPageResponse} from "../application/responses/PlanetPageResponse";
import {PlanetPagePresenter} from "./PlanetPagePresenter";
import {
  PlanetPageViewModel,
  PlanetPowerTabViewModel,
  PlanetTerraformationTabViewModel
} from "./viewModels/PlanetPageViewModel";
import {NotificationViewModel} from "./viewModels/NotificationViewModel";

const nbsp = ' ';

const TOXICITY_ENERGY_LEVELS: PlanetEnergyLevelsResponse = {
  planetId: 1,
  planetName: 'Toxicity',
  production: 1_000,
  consumption: 0,
  available: 1_000,
  balance: 'surplus',
  productionBreakdown: [{name: 'EnergyGenerator3', quantity: 1, unitLevel: 1_000, totalLevel: 1_000, productionRatio: 1}],
  consumptionBreakdown: [],
  optimizers: []
};

const TOXICITY_TERRAFORMATION: PlanetTerraformationResponse = {
  levels: {
    planetId: 'Toxicity',
    unitOxygenLevel: 100,
    unitHeatLevel: 200,
    unitPressureLevel: 300,
    unitPlantsLevel: 400,
    unitInsectsLevel: 500,
    unitAnimalsLevel: 600,
    unitPurificationLevel: 700,
    terraformationIndex: 2_800,
    biomass: 1_500
  }
};

const TOXICITY_PLANET_PAGE: PlanetPageResponse = {
  gameRelease: '2.004',
  gameReleaseIsEarlierThanCurrent: true,
  powerConsumptionModifier: 1.5,
  powerConsumptionIsModified: true,
  planetName: 'Toxicity',
  energyLevels: TOXICITY_ENERGY_LEVELS,
  terraformation: TOXICITY_TERRAFORMATION,
  worldObjectLabels: {EnergyGenerator3: 'Solar panel T2'}
};

const SAVE_NOTIFICATIONS: NotificationViewModel[] = [
  {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
  {severity: 'warning', message: 'Values of game release 2.004'},
  {severity: 'information', message: "Consumption applies the save's Power Consumption modifier: 150%"}
];

describe('PlanetPagePresenter', () => {
  it('should initialize with the submerged machines limitation and no planet', () => {
    // Act
    const presenter = new PlanetPagePresenter();

    // Assert
    expect<PlanetPageViewModel>(presenter.viewModel).toEqual({
      planetName: '',
      power: {notifications: [{severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}]},
      terraformation: {}
    });
  });

  it('should name the page after the planet and give each tab the zone of that planet', () => {
    // Arrange
    const presenter = new PlanetPagePresenter();

    // Act
    presenter.displayPlanetPage(TOXICITY_PLANET_PAGE);

    // Assert
    expect(presenter.viewModel.planetName).toBe('Toxicity');
    expect(presenter.viewModel.power.zone?.production.value).toBe(`1,000${nbsp}kW`);
    expect(presenter.viewModel.terraformation.zone?.terraformationIndex.value).toBe(`2.8${nbsp}kTi`);
  });

  it('should show the power notifications of the save on the Power tab', () => {
    // Arrange
    const presenter = new PlanetPagePresenter();

    // Act
    presenter.displayPlanetPage(TOXICITY_PLANET_PAGE);

    // Assert
    expect<NotificationViewModel[]>(presenter.viewModel.power.notifications).toEqual([
      {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
      {severity: 'warning', message: 'Values of game release 2.004'},
      {severity: 'information', message: "Consumption applies the save's Power Consumption modifier: 150%"}
    ]);
  });

  describe('When the planet has no machine placed', () => {
    it('should say on the Power tab that no machine is placed, under the power notifications', () => {
      // Arrange
      const presenter = new PlanetPagePresenter();
      const noEnergyLevels = undefined;

      // Act
      presenter.displayPlanetPage({...TOXICITY_PLANET_PAGE, energyLevels: noEnergyLevels});

      // Assert
      expect<PlanetPowerTabViewModel>(presenter.viewModel.power).toEqual({
        notifications: SAVE_NOTIFICATIONS,
        absentZone: 'No machine placed'
      });
    });
  });

  describe('When the planet has no terraformation level', () => {
    it('should say on the Terraformation tab that no terraformation level is recorded', () => {
      // Arrange
      const presenter = new PlanetPagePresenter();
      const noTerraformation = undefined;

      // Act
      presenter.displayPlanetPage({...TOXICITY_PLANET_PAGE, terraformation: noTerraformation});

      // Assert
      expect<PlanetTerraformationTabViewModel>(presenter.viewModel.terraformation).toEqual({absentZone: 'No terraformation level recorded'});
    });
  });

  describe('When the planet has no name', () => {
    it('should name the page after the numeric identifier of the planet', () => {
      // Arrange
      const presenter = new PlanetPagePresenter();
      const noPlanetName = undefined;

      // Act
      presenter.displayPlanetPage({
        ...TOXICITY_PLANET_PAGE,
        planetName: noPlanetName,
        energyLevels: {...TOXICITY_ENERGY_LEVELS, planetName: noPlanetName},
        terraformation: undefined
      });

      // Assert
      expect(presenter.viewModel.planetName).toBe('Planet 1');
    });
  });

  describe('When the planet is not in the save', () => {
    it('should say that the planet is not in the loaded save, with no tab content', () => {
      // Arrange
      const presenter = new PlanetPagePresenter();

      // Act
      presenter.displayUnknownPlanet();

      // Assert
      expect<PlanetPageViewModel>(presenter.viewModel).toEqual({
        planetName: '',
        unknownPlanet: 'This planet is not in the loaded save.',
        power: {notifications: []},
        terraformation: {}
      });
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should show the unreadable lines in place of the planet', () => {
      // Arrange
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = new PlanetPagePresenter();

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect<PlanetPageViewModel>(presenter.viewModel).toEqual({
        planetName: '',
        power: {notifications: []},
        terraformation: {},
        unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]
      });
    });
  });
});
