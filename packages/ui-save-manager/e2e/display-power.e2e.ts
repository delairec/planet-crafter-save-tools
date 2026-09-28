import {type Locator, type Page} from '@playwright/test';
import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const skeoUpdateSaveFixturePath = locateTheFixture('skeo-update_valid.json');

const submergedMachinesNotification = 'Submerged machines may distort the computed available energy.';
const gameReleaseNotificationPrefix = 'Values of game release';

function findTheNotifications(page: Page, notificationText: string): Locator {
  return page.getByTestId(/^energy-levels-notification-\d+$/).filter({hasText: notificationText});
}

test.describe('Power page', () => {
  test.describe('When the Power page of a visualized save is opened', () => {
    test('should open on a breadcrumb naming the Save group and the Power page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Save', 'Power']);
    });
  });

  test.describe('When the Power page of a save written by the Skeo update is opened', () => {
    test('should name the planet of its placed world object Skeo and the power that object produces', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId(/^energy-levels-planet-\d+-title$/)).toHaveText(['Skeo']);
      await expect(page.getByTestId(/^energy-production-\d+-item-label-\d+$/)).toContainText(['Wind turbine T2']);
    });

    test('should warn once, under the Power title, that submerged machines may distort the computed available energy', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('energy-levels-title')).toHaveText('Power');
      await expect(findTheNotifications(page, submergedMachinesNotification)).toHaveCount(1);
      await expect(findTheNotifications(page, submergedMachinesNotification)).toBeVisible();
    });

    test('should name the severity of that notification a limitation', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(findTheNotifications(page, submergedMachinesNotification).getByTestId(/^energy-levels-notification-\d+-severity$/))
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
      const firstPlanetTop = (await page.getByTestId('energy-levels-planet-0-title').boundingBox())!.y;
      expect(gameReleaseNotificationTop).toBeGreaterThan(submergedMachinesNotificationTop);
      expect(gameReleaseNotificationTop).toBeLessThan(firstPlanetTop);
    });
  });
});
