import {type Locator, type Page} from '@playwright/test';
import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const skeoUpdateSaveFixturePath = locateTheFixture('skeo-update_valid.json');

const submergedMachinesNotification = 'Submerged machines may distort the computed available energy.';
const gameReleaseNotificationPrefix = 'Values of game release';

function findTheNotifications(page: Page, notificationText: string): Locator {
  return page.getByTestId(/^power-notification-\d+$/).filter({hasText: notificationText});
}

async function displayThePowerAs(page: Page, formLabel: string): Promise<void> {
  await page.getByTestId('power-display-form').selectOption({label: formLabel});
}

test.describe('Power page', () => {
  test.describe('When the Power page of a visualized save is opened', () => {
    test('should open on a breadcrumb naming the Save group, the Power page and the planet of the selected tab', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Save', 'Power', 'Skeo']);
    });
  });

  test.describe('When the Power page of a save written by the Skeo update is opened', () => {
    test('should name the planet of its placed world object Skeo and the power that object produces', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-planet-tab-0')).toHaveText('Skeo');
      await expect(page.getByTestId('power-planet-tab-0')).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByTestId('power-planet-title')).toHaveText('Skeo');
      await expect(page.getByTestId(/^power-chart-production-bar-\d+-label$/)).toContainText(['Wind turbine T2']);
    });

    test('should offer Bars by machine and Table under Display as, Bars by machine chosen', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-display-form-label')).toHaveText('Display as');
      await expect(page.getByTestId(/^power-display-form-option-/)).toHaveText(['Bars by machine', 'Table']);
      await expect(page.getByTestId('power-display-form')).toHaveValue('bars');
    });

    test('should chart the production and the consumption side by side as bars, each ending on its value, over ticks and a legend', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-chart-production-title')).toHaveText('Production');
      await expect(page.getByTestId('power-chart-consumption-title')).toHaveText('Consumption');
      await expect(page.getByTestId('power-chart-production-bar-0-value')).toHaveText(/\skW$/);
      await expect(page.getByTestId(/^power-chart-production-tick-\d+$/)).toHaveCount(5);
      await expect(page.getByTestId(/^power-chart-legend-\d+$/)).toContainText(['Producers', 'Consumers']);
      await expect(page.getByTestId('power-producers')).toHaveCount(0);
    });

    test('should name the type, its quantity, its unit, its total and its share once a bar holds the keyboard focus', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);
      await openThePageOfTheMenu(page, 'Power');

      // Act
      await page.getByTestId('power-chart-production-bar-0').focus();

      // Assert
      await expect(page.getByTestId('power-chart-production-bar-0-description')).toBeVisible();
      await expect(page.getByTestId('power-chart-production-bar-0-description'))
        .toHaveText(/^Wind turbine T2\s+\d+ × [\d.,]+\skW = [\d.,]+\skW · \d+% of production$/);
    });

    test('should show the production, the consumption and the available power, the available one carrying the status pill', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-production')).toContainText('Production');
      await expect(page.getByTestId('power-consumption')).toContainText('Consumption');
      await expect(page.getByTestId('power-available')).toContainText('Available');
      await expect(page.getByTestId('power-available-balance')).toHaveText(/^Surplus, /);
    });

    test('should show the optimizers before the producers and the consumers, each table ending on a total row, once Table is chosen', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);
      await openThePageOfTheMenu(page, 'Power');

      // Act
      await displayThePowerAs(page, 'Table');

      // Assert
      const optimizersTop = (await page.getByTestId('power-optimizers-title').boundingBox())!.y;
      const producersTop = (await page.getByTestId('power-producers-title').boundingBox())!.y;
      expect(optimizersTop).toBeLessThan(producersTop);
      await expect(page.getByTestId('power-producers-total')).toHaveText(/^Total/);
      await expect(page.getByTestId('power-consumers-total')).toHaveText(/^Total/);
      await expect(page.getByTestId('power-breakdown-summary')).toHaveText(/producers? · \d+ consumers? · \d+ optimizers?$/);
    });

    test('should warn once, under the Power title, that submerged machines may distort the computed available energy', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-title')).toHaveText('Power');
      await expect(findTheNotifications(page, submergedMachinesNotification)).toHaveCount(1);
      await expect(findTheNotifications(page, submergedMachinesNotification)).toBeVisible();
    });

    test('should name the severity of that notification a limitation', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(findTheNotifications(page, submergedMachinesNotification).getByTestId(/^power-notification-\d+-severity$/))
        .toHaveText('Limitation');
    });
  });

  test.describe('When Table is chosen and the reader comes back to the Power page from another page', () => {
    test('should keep the tables chosen', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);
      await openThePageOfTheMenu(page, 'Power');
      await displayThePowerAs(page, 'Table');
      await openThePageOfTheMenu(page, 'Overview');

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-display-form')).toHaveValue('table');
      await expect(page.getByTestId('power-producers-total')).toHaveText(/^Total/);
      await expect(page.getByTestId('power-chart-production-title')).toHaveCount(0);
    });
  });

  test.describe('When the Power page of a save of the current game release is opened', () => {
    test('should name no game release', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(findTheNotifications(page, submergedMachinesNotification)).toBeVisible();
      await expect(findTheNotifications(page, gameReleaseNotificationPrefix)).toHaveCount(0);
    });
  });

  test.describe('When the Power page of a save of a legacy game release is opened', () => {
    test('should name that game release in a notification, under the submerged machines one', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      const gameReleaseNotification = findTheNotifications(page, gameReleaseNotificationPrefix);
      await expect(gameReleaseNotification).toHaveText(/Values of game release 2\.004$/);
      const submergedMachinesNotificationTop = (await findTheNotifications(page, submergedMachinesNotification).boundingBox())!.y;
      const gameReleaseNotificationTop = (await gameReleaseNotification.boundingBox())!.y;
      const figureTilesTop = (await page.getByTestId('power-production').boundingBox())!.y;
      expect(gameReleaseNotificationTop).toBeGreaterThan(submergedMachinesNotificationTop);
      expect(gameReleaseNotificationTop).toBeLessThan(figureTilesTop);
    });
  });
});
