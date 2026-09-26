import {expect, test} from '@playwright/test';
import {findTheBreadcrumbSteps, openThePageOfTheMenu, visualizeTheSave} from './saveManagerShell';

const baselineSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const skeoUpdateSaveFixturePath = new URL('./fixtures/skeo-update_valid.json', import.meta.url).pathname;

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
      await expect(page.getByRole('heading', {name: 'Skeo', level: 4})).toBeVisible();
      await expect(page.getByText('Wind turbine T2')).toBeVisible();
    });

    test('should warn once, under the Power title, that submerged machines may distort the computed available energy', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByRole('heading', {name: 'Power', level: 3})).toBeVisible();
      await expect(page.getByText('Submerged machines may distort the computed available energy')).toHaveCount(1);
      await expect(page.getByText('Submerged machines may distort the computed available energy')).toBeVisible();
    });
  });

  test.describe('When the Power page of a save of the current game release is opened', () => {
    test('should name no game release', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByRole('heading', {name: 'Power', level: 3})).toBeVisible();
      await expect(page.getByText('Values of game release')).toHaveCount(0);
    });
  });

  test.describe('When the Power page of a save of a legacy game release is opened', () => {
    test('should name that game release in a notification, under the submerged machines one', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByText('Values of game release 2.004')).toBeVisible();
      const submergedMachinesNotificationTop = (await page.getByText('Submerged machines may distort the computed available energy').boundingBox())!.y;
      const gameReleaseNotificationTop = (await page.getByText('Values of game release 2.004').boundingBox())!.y;
      const firstPlanetTop = (await page.getByRole('heading', {name: 'Planet 1', level: 4}).boundingBox())!.y;
      expect(gameReleaseNotificationTop).toBeGreaterThan(submergedMachinesNotificationTop);
      expect(gameReleaseNotificationTop).toBeLessThan(firstPlanetTop);
    });
  });
});
