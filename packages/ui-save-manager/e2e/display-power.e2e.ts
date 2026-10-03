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
      await expect(page.getByTestId('power-planet-name')).toHaveText('Skeo');
      await expect(page.getByTestId(/^power-producers-row-\d+$/)).toContainText(['Wind turbine T2']);
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
      await expect(page.getByTestId('power-available-balance')).toHaveText(await page.getByTestId('power-planet-balance').textContent() ?? '');
    });

    test('should show the optimizers before the producers and the consumers, each table ending on a total row', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

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
