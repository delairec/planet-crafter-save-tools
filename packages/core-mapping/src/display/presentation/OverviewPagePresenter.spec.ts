import {describe, expect, it} from 'bun:test';
import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {EnergySettingsResponse} from "../application/responses/EnergySettingsResponse";
import {OverviewPageResponse, OverviewPlanetResponse} from "../application/responses/OverviewPageResponse";
import {OverviewPagePresenter} from "./OverviewPagePresenter";
import {
  OverviewPageViewModel,
  OverviewPlanetCardViewModel,
  OverviewPlanetPowerViewModel
} from "./viewModels/OverviewPageViewModel";
import {NotificationViewModel} from "./viewModels/NotificationViewModel";

const nbsp = ' ';
const minus = '−';

const NO_PLANETS: OverviewPlanetResponse[] = [];

const CURRENT_ENERGY_SETTINGS: EnergySettingsResponse = {
  gameRelease: '2.103',
  gameReleaseIsEarlierThanCurrent: false,
  powerConsumptionModifier: 1,
  powerConsumptionIsModified: false
};

const OVERVIEW_WITHOUT_PLANETS: OverviewPageResponse = {
  saveFile: {name: 'Standard-1.json', size: 2_540},
  saveConfiguration: {displayName: 'Six Planets', mode: 'Custom', gameRelease: '2.103'},
  progression: {allTimeTerraTokens: 42_000},
  planets: NO_PLANETS,
  energySettings: CURRENT_ENERGY_SETTINGS
};

const PRIME_PLANET: OverviewPlanetResponse = {
  planetName: 'Prime',
  terraformation: {
    planetId: 'Prime',
    unitOxygenLevel: 123_123,
    unitHeatLevel: 456_456,
    unitPressureLevel: 789_789,
    unitPlantsLevel: 101_101,
    unitInsectsLevel: 112_112,
    unitAnimalsLevel: 131_131,
    unitPurificationLevel: 415_415,
    terraformationIndex: 2_129_127,
    biomass: 344_344
  },
  energy: {numericPlanetId: -1140328421, production: 1_000, consumption: 500, available: 500}
};

const HUMBLE_PLANET: OverviewPlanetResponse = {
  planetName: 'Humble',
  terraformation: {
    planetId: 'Humble',
    unitOxygenLevel: 123_123,
    unitHeatLevel: 456_456,
    unitPressureLevel: 789_789,
    unitPlantsLevel: 101_101,
    unitInsectsLevel: 112_112,
    unitAnimalsLevel: 131_131,
    unitPurificationLevel: undefined,
    terraformationIndex: 1_713_712,
    biomass: 344_344
  },
  energy: {numericPlanetId: -1083271456, production: 500, consumption: 2_000, available: -1_500}
};

const TOXICITY_PLANET_WITHOUT_MACHINES: OverviewPlanetResponse = {
  planetName: 'Toxicity',
  terraformation: {
    planetId: 'Toxicity',
    unitOxygenLevel: 1_000,
    unitHeatLevel: 2_000,
    unitPressureLevel: 3_000,
    unitPlantsLevel: 400,
    unitInsectsLevel: 500,
    unitAnimalsLevel: 600,
    unitPurificationLevel: undefined,
    terraformationIndex: 7_500,
    biomass: 1_500
  }
};

const UNNAMED_PLANET_WITHOUT_TERRAFORMATION: OverviewPlanetResponse = {
  energy: {numericPlanetId: 1, production: 1_000, consumption: 250, available: 750}
};

const PRIME_PLANET_WITHOUT_POWER: OverviewPlanetResponse = {
  ...PRIME_PLANET,
  energy: {numericPlanetId: -1140328421, production: 0, consumption: 0, available: 0}
};

describe('OverviewPagePresenter', () => {
  it('should name the save in the identity and show the progression tiles', () => {
    // Arrange
    const presenter = new OverviewPagePresenter();

    // Act
    presenter.displayOverviewPage({
      saveFile: {name: 'Standard-1.json', size: 2_540},
      saveConfiguration: {displayName: 'Six Planets', mode: 'Custom', gameRelease: '2.103'},
      progression: {allTimeTerraTokens: 42_000, totalCraftedObjects: 1_310, droneLogistics: {paused: true, effect: 'penalisesThePlayer'}},
      planets: NO_PLANETS,
      energySettings: CURRENT_ENERGY_SETTINGS
    });

    // Assert
    expect<OverviewPageViewModel>(presenter.viewModel).toEqual({
      identity: {title: 'Six Planets', hint: `Custom · Game release 2.103 · 2.48${nbsp}KB`},
      notifications: [{severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}],
      tiles: {
        allTimeTerraTokens: {label: 'All time Terra Tokens', value: '42,000', unit: '=tt='},
        totalCraftedObjects: {label: 'Total crafted objects', value: '1,310'},
        droneLogistics: {label: 'Drone logistics', badge: {value: 'Paused', tone: 'danger', toneLabel: 'penalises the player'}}
      },
      planets: {title: 'Planets', hint: '0 planets', cards: []}
    });
  });

  describe('When the save has neither statistics nor drone logistics', () => {
    it('should show the Terra Tokens tile alone', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({
        saveFile: {name: 'Standard-1.json', size: 2_540},
        saveConfiguration: {displayName: 'Six Planets', mode: 'Custom', gameRelease: '2.103'},
        progression: {allTimeTerraTokens: 42_000},
        planets: NO_PLANETS,
        energySettings: CURRENT_ENERGY_SETTINGS
      });

      // Assert
      expect(presenter.viewModel.tiles).toEqual({
        allTimeTerraTokens: {label: 'All time Terra Tokens', value: '42,000', unit: '=tt='}
      });
    });
  });

  describe('When the save has a SysTi', () => {
    it.each<{situation: string; index: number; planetCount: number; value: string; caption: string}>([
      {situation: 'one planet', index: 7_500, planetCount: 1, value: `7.5${nbsp}kSysTi`, caption: 'multiplied over 1 planet'},
      {situation: 'several planets', index: 4.369e54, planetCount: 4, value: `4.369${nbsp}SpdSysTi`, caption: 'multiplied over 4 planets'}
    ])('should show the SysTi tile in the game unit, its caption counting $situation', ({index, planetCount, value, caption}) => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({...OVERVIEW_WITHOUT_PLANETS, systemTerraformationIndex: {index, planetCount}});

      // Assert
      expect(presenter.viewModel.tiles).toEqual({
        allTimeTerraTokens: {label: 'All time Terra Tokens', value: '42,000', unit: '=tt='},
        systemTerraformationIndex: {label: 'System Terraformation Index', value, caption}
      });
    });
  });

  describe('When the save has no configuration', () => {
    it('should name the save after its file and give its size alone', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({
        saveFile: {name: 'Standard-1.json', size: 2_097_152},
        progression: {allTimeTerraTokens: 42_000},
        planets: NO_PLANETS,
        energySettings: CURRENT_ENERGY_SETTINGS
      });

      // Assert
      expect(presenter.viewModel.identity).toEqual({title: 'Standard-1.json', hint: `2${nbsp}MB`});
    });
  });

  describe('When the save takes the energy values of an earlier game release', () => {
    it('should show the power notifications under the identity', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({...OVERVIEW_WITHOUT_PLANETS, energySettings: {...CURRENT_ENERGY_SETTINGS, gameRelease: '2.004', gameReleaseIsEarlierThanCurrent: true}});

      // Assert
      expect<NotificationViewModel[]>(presenter.viewModel.notifications).toEqual([
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
        {severity: 'warning', message: 'Values of game release 2.004'}
      ]);
    });
  });

  describe('When the save holds planets', () => {
    it.each<[string, OverviewPlanetResponse[], string]>([
      ['one planet', [PRIME_PLANET], '1 planet'],
      ['several planets', [PRIME_PLANET, HUMBLE_PLANET, TOXICITY_PLANET_WITHOUT_MACHINES], '3 planets']
    ])('should count %s beside the planets title', (_planetsCase, planets, expectedHint) => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({...OVERVIEW_WITHOUT_PLANETS, planets});

      // Assert
      expect(presenter.viewModel.planets.hint).toBe(expectedHint);
    });
  });

  describe('When the planets have terraformation levels and machines placed', () => {
    it('should show the terraformation figures of each planet, then its power on a scale common to every planet', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({...OVERVIEW_WITHOUT_PLANETS, planets: [PRIME_PLANET, HUMBLE_PLANET]});

      // Assert
      expect<OverviewPlanetCardViewModel[]>(presenter.viewModel.planets.cards).toEqual([
        {
          name: 'Prime',
          terraformation: {
            terraformationIndex: {label: 'Terraformation Index', value: `2.129${nbsp}MTi`},
            figures: [
              {label: 'O²', value: `123.123${nbsp}ppt`},
              {label: 'Heat', value: `456.456${nbsp}nK`},
              {label: 'Pressure', value: `789.789${nbsp}µPa`},
              {label: 'Purification', value: `415.415${nbsp}kPu`},
              {label: 'Biomass', value: `344.344${nbsp}kg`}
            ]
          },
          power: {
            production: {label: 'Production', value: `1,000${nbsp}kW`, widthPercentage: 50},
            consumption: {label: 'Consumption', value: `500${nbsp}kW`, widthPercentage: 25},
            available: {label: 'Available', value: `+500${nbsp}kW`},
            shareOfProductionConsumed: '50% of production consumed'
          }
        },
        {
          name: 'Humble',
          terraformation: {
            terraformationIndex: {label: 'Terraformation Index', value: `1.714${nbsp}MTi`},
            figures: [
              {label: 'O²', value: `123.123${nbsp}ppt`},
              {label: 'Heat', value: `456.456${nbsp}nK`},
              {label: 'Pressure', value: `789.789${nbsp}µPa`},
              {label: 'Biomass', value: `344.344${nbsp}kg`}
            ]
          },
          power: {
            production: {label: 'Production', value: `500${nbsp}kW`, widthPercentage: 25},
            consumption: {label: 'Consumption', value: `2,000${nbsp}kW`, widthPercentage: 100},
            available: {label: 'Available', value: `${minus}1,500${nbsp}kW`},
            shareOfProductionConsumed: '400% of production consumed'
          }
        }
      ]);
    });
  });

  describe('When a planet has terraformation levels but no machine placed', () => {
    it('should show its terraformation figures and say that no machine is placed', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({...OVERVIEW_WITHOUT_PLANETS, planets: [TOXICITY_PLANET_WITHOUT_MACHINES]});

      // Assert
      expect<OverviewPlanetCardViewModel[]>(presenter.viewModel.planets.cards).toEqual([
        {
          name: 'Toxicity',
          terraformation: {
            terraformationIndex: {label: 'Terraformation Index', value: `7.5${nbsp}kTi`},
            figures: [
              {label: 'O²', value: `1${nbsp}ppt`},
              {label: 'Heat', value: `2${nbsp}nK`},
              {label: 'Pressure', value: `3${nbsp}µPa`},
              {label: 'Biomass', value: `1.5${nbsp}kg`}
            ]
          },
          absentSide: 'No machine placed'
        }
      ]);
    });
  });

  describe('When a planet without a name has machines placed but no terraformation level', () => {
    it('should name it after its numeric identifier, show its power and say that no terraformation level is recorded', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({...OVERVIEW_WITHOUT_PLANETS, planets: [UNNAMED_PLANET_WITHOUT_TERRAFORMATION]});

      // Assert
      expect<OverviewPlanetCardViewModel[]>(presenter.viewModel.planets.cards).toEqual([
        {
          name: 'Planet 1',
          power: {
            production: {label: 'Production', value: `1,000${nbsp}kW`, widthPercentage: 100},
            consumption: {label: 'Consumption', value: `250${nbsp}kW`, widthPercentage: 25},
            available: {label: 'Available', value: `+750${nbsp}kW`},
            shareOfProductionConsumed: '25% of production consumed'
          },
          absentSide: 'No terraformation level recorded'
        }
      ]);
    });
  });

  describe('When no planet produces nor consumes power', () => {
    it('should draw empty bars without a share of production consumed', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();

      // Act
      presenter.displayOverviewPage({...OVERVIEW_WITHOUT_PLANETS, planets: [PRIME_PLANET_WITHOUT_POWER]});

      // Assert
      expect<OverviewPlanetPowerViewModel | undefined>(presenter.viewModel.planets.cards[0]?.power).toEqual({
        production: {label: 'Production', value: `0${nbsp}kW`, widthPercentage: 0},
        consumption: {label: 'Consumption', value: `0${nbsp}kW`, widthPercentage: 0},
        available: {label: 'Available', value: `0${nbsp}kW`}
      });
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should expose the unreadable lines instead of the overview', () => {
      // Arrange
      const presenter = new OverviewPagePresenter();
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: {name: 'worldObjects', index: 78}, entryIndex: 2, line: '{not valid json'}];

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect<OverviewPageViewModel>(presenter.viewModel).toEqual({
        identity: {title: '', hint: ''},
        notifications: [],
        tiles: {},
        planets: {title: 'Planets', hint: '', cards: []},
        unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]
      });
    });
  });
});
