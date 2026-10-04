import {type Page} from '@playwright/test';
import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const energyConsumptionSaveFixturePath = locateTheFixture('energy-consumption_valid.json');

async function openThePageOfThePlanetCard(page: Page, cardIndex: number): Promise<void> {
  await page.getByTestId(`overview-planet-${cardIndex}-details`).click();
}

test.describe('Planet page', () => {
  test.describe('When the Details button of a planet card of the Overview is pressed', () => {
    test('should open on a breadcrumb naming the Save group, the Overview and the planet', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfThePlanetCard(page, 0);

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Save', 'Overview', 'Toxicity']);
    });

    test('should offer the Power tab then the Terraformation tab, opening on Power', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfThePlanetCard(page, 0);

      // Assert
      await expect(page.getByTestId(/^planet-view-tab-[a-z]+$/)).toHaveText(['Power', 'Terraformation']);
      await expect(page.getByTestId('planet-view-tab-power')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('planet-view-tab-terraformation')).toHaveAttribute('aria-selected', 'false');
    });

    test('should show on the Power tab the notifications and the power the Power page shows for that planet', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfThePlanetCard(page, 0);

      // Assert
      await expect(page.getByTestId('power-planet-title')).toHaveText('Toxicity');
      await expect(page.getByTestId('power-notification-0')).toHaveText('Submerged machines may distort the computed available energy.');
      await expect(page.getByTestId('power-production')).toContainText('497.25 kW');
      await expect(page.getByTestId('power-display-form')).toHaveValue('bars');
      await expect(page.getByTestId('terraformation-index-value')).toHaveCount(0);
    });
  });

  test.describe('When the Terraformation tab of a planet page is chosen', () => {
    test('should show the hero figures and the tables the Terraformation page shows for that planet', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);
      await openThePageOfThePlanetCard(page, 0);

      // Act
      await page.getByTestId('planet-view-tab-terraformation').click();

      // Assert
      await expect(page.getByTestId('planet-view-tab-terraformation')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('terraformation-planet-title')).toHaveText('Toxicity');
      await expect(page.getByTestId('terraformation-index-value')).toHaveText('2.8 kTi');
      await expect(page.getByTestId('terraformation-environmental-levels')).toBeVisible();
      await expect(page.getByTestId('terraformation-organic-levels')).toBeVisible();
      await expect(page.getByTestId('power-planet-title')).toHaveCount(0);
    });
  });

  test.describe('When Overview is chosen in the breadcrumb of a planet page', () => {
    test('should lead back to the Overview', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);
      await openThePageOfThePlanetCard(page, 0);

      // Act
      await page.getByTestId('current-page-name').click();

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Overview']);
      await expect(page.getByTestId('overview-planet-0-name')).toHaveText('Toxicity');
    });
  });

  test.describe('When the page of a planet without a name is opened from its card', () => {
    test('should name the planet after its numeric identifier and show its power', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfThePlanetCard(page, 1);

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Save', 'Overview', 'Planet 1']);
      await expect(page.getByTestId('power-planet-title')).toHaveText('Planet 1');
    });

    test('should say on the Terraformation tab that no terraformation level is recorded', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfThePlanetCard(page, 1);

      // Act
      await page.getByTestId('planet-view-tab-terraformation').click();

      // Assert
      await expect(page.getByTestId('planet-terraformation-absent')).toHaveText('No terraformation level recorded');
    });
  });

  test.describe('When the page of a planet that places no machine is opened from its card', () => {
    test('should say on the Power tab that no machine is placed, under the power notifications', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfThePlanetCard(page, 0);

      // Assert
      await expect(page.getByTestId('planet-power-absent')).toHaveText('No machine placed');
      await expect(page.getByTestId('power-notification-0')).toHaveText('Submerged machines may distort the computed available energy.');
    });
  });

  test.describe('When a display form is chosen on the Power tab of a planet page', () => {
    test('should keep it chosen on the Power page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);
      await openThePageOfThePlanetCard(page, 0);
      await page.getByTestId('power-display-form').selectOption({label: 'Table'});

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-display-form')).toHaveValue('table');
    });
  });
});
