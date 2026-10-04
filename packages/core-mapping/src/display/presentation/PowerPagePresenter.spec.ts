import {describe, expect, it} from 'bun:test';
import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {WORLD_OBJECTS_SECTION} from "../../save/testing/saveSectionLocations";
import {PowerPagePresenter} from "./PowerPagePresenter";
import {PowerPageViewModel} from "./viewModels/PowerPageViewModel";

describe('PowerPagePresenter', () => {
  it('should initialize with the submerged machines limitation and no planet', () => {
    // Act
    const presenter = new PowerPagePresenter();

    // Assert
    expect<PowerPageViewModel>(presenter.viewModel).toEqual({
      notifications: [{severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'}],
      planets: []
    });
  });

  it('should present the notifications of the save, then one zone per planet', () => {
    // Arrange
    const presenter = new PowerPagePresenter();

    // Act
    presenter.displayPowerPage({
      gameRelease: '2.004',
      gameReleaseIsEarlierThanCurrent: true,
      powerConsumptionModifier: 1.5,
      powerConsumptionIsModified: true,
      worldObjectLabels: {EnergyGenerator3: 'Solar panel T2'},
      planets: [{
        planetId: 1,
        planetName: 'Prime',
        production: 50,
        consumption: 0,
        available: 50,
        balance: 'surplus',
        productionBreakdown: [{name: 'EnergyGenerator3', quantity: 1, unitLevel: 50, totalLevel: 50, productionRatio: 1}],
        consumptionBreakdown: [],
        optimizers: []
      }]
    });

    // Assert
    expect<PowerPageViewModel>(presenter.viewModel).toEqual({
      notifications: [
        {severity: 'limitation', message: 'Submerged machines may distort the computed available energy.'},
        {severity: 'warning', message: 'Values of game release 2.004'},
        {severity: 'information', message: "Consumption applies the save's Power Consumption modifier: 150%"}
      ],
      planets: [expect.objectContaining({planetName: 'Prime'})]
    });
  });

  describe('When the save has unreadable lines', () => {
    it('should show the unreadable lines in place of the planets', () => {
      // Arrange
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = new PowerPagePresenter();

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect<PowerPageViewModel>(presenter.viewModel).toEqual({notifications: [], planets: [], unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]});
    });
  });
});
