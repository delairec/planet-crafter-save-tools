import {describe, expect, it} from 'bun:test';
import {UnreadableLineResponse} from "../../save/application/responses/UnreadableLineResponse";
import {WORLD_OBJECTS_SECTION} from "../../save/testing/saveSectionLocations";
import {TerraformationPagePresenter} from "./TerraformationPagePresenter";
import {TerraformationPageViewModel} from "./viewModels/TerraformationPageViewModel";

describe('TerraformationPagePresenter', () => {
  it('should initialize with no planet', () => {
    // Act
    const presenter = new TerraformationPagePresenter();

    // Assert
    expect<TerraformationPageViewModel>(presenter.viewModel).toEqual({planets: []});
  });

  it('should present one zone per planet, in the order of the save', () => {
    // Arrange
    const presenter = new TerraformationPagePresenter();

    // Act
    presenter.displayTerraformationPage({
      planets: [
        {
          levels: {
            planetId: 'Prime',
            unitOxygenLevel: 400_000,
            unitHeatLevel: 100_000,
            unitPressureLevel: 0,
            unitPlantsLevel: 800,
            unitInsectsLevel: 200,
            unitAnimalsLevel: 0,
            unitPurificationLevel: undefined,
            terraformationIndex: 501_000,
            biomass: 1_000
          },
          systemTerraformationIndex: {index: 501_000, planetCount: 1}
        },
        {
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
        }
      ]
    });

    // Assert
    expect(presenter.viewModel).toMatchObject({planets: [{planetName: 'Prime'}, {planetName: 'Aqualis'}]});
  });

  describe('When the save has unreadable lines', () => {
    it('should show the unreadable lines in place of the planets', () => {
      // Arrange
      const unreadableLines: UnreadableLineResponse[] = [{code: 'invalid-json', section: WORLD_OBJECTS_SECTION, entryIndex: 2, line: '{not valid json'}];
      const presenter = new TerraformationPagePresenter();

      // Act
      presenter.displaySaveWithUnreadableLines({unreadableLines});

      // Assert
      expect<TerraformationPageViewModel>(presenter.viewModel).toEqual({planets: [], unreadableLines: [{message: 'Invalid JSON: {not valid json', location: 'World objects (section 78), entry 2'}]});
    });
  });
});
