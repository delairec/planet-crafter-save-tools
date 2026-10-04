import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const energyConsumptionSaveFixturePath = locateTheFixture('energy-consumption_valid.json');

test.describe('Terraformation page', () => {
  test.describe('When the Terraformation page of a visualized save is opened', () => {
    test('should open on a breadcrumb naming the Save group, the Terraformation page and the planet of the selected tab', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Save', 'Terraformation', 'Toxicity']);
    });

    test('should offer one tab per planet, the first one selected', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

      // Assert
      await expect(page.getByTestId(/^terraformation-planet-tab-\d+$/)).toHaveText(['Toxicity']);
      await expect(page.getByTestId('terraformation-planet-tab-0')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('terraformation-planet-title')).toHaveText('Toxicity');
    });

    test('should show the Terraformation Index of the planet captioned with the SysTi it multiplies', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

      // Assert
      await expect(page.getByTestId('terraformation-index-value')).toHaveText('2.8 kTi');
      await expect(page.getByTestId('terraformation-index-caption')).toHaveText('Terraformation Index · factor of the 2.8 kSysTi multiplied over 1 planet');
    });

    test('should show the biomass of the planet captioned with the shares of plants and insects', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

      // Assert
      await expect(page.getByTestId('terraformation-biomass-value')).toHaveText('1.5 kg');
      await expect(page.getByTestId('terraformation-biomass-caption')).toHaveText('Biomass · plants 27%, insects 33%');
    });

    test('should list the environmental levels, then the organic levels, each value beside its bar', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

      // Assert
      await expect(page.getByTestId(/^terraformation-environmental-levels-row-\d+-label$/)).toHaveText(['O²', 'Heat', 'Pressure', 'Purification']);
      await expect(page.getByTestId(/^terraformation-environmental-levels-row-\d+-value$/)).toHaveText(['100 ppq', '200 pK', '300 nPa', '700 Pu']);
      await expect(page.getByTestId(/^terraformation-organic-levels-row-\d+-label$/)).toHaveText(['Plants', 'Insects', 'Animals']);
      await expect(page.getByTestId(/^terraformation-organic-levels-row-\d+-value$/)).toHaveText(['400 g', '500 g', '600 g']);
    });

    test('should fill the bar of the largest row of a table', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

      // Assert
      await expect(page.getByTestId('terraformation-environmental-levels-row-3-bar')).toHaveAttribute('style', 'width: 100%;');
    });

    test('should start the bars of every row of a table at the same place', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);
      await openThePageOfTheMenu(page, 'Terraformation');

      // Act
      const firstRowBar = await page.getByTestId('terraformation-environmental-levels-row-0-bar').boundingBox();
      const lastRowBar = await page.getByTestId('terraformation-environmental-levels-row-3-bar').boundingBox();

      // Assert
      expect(lastRowBar?.x).toBe(firstRowBar?.x);
    });
  });
});
