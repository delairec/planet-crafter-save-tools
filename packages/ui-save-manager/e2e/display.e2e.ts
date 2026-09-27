import {expect, test} from '@playwright/test';
import {visualizeSave} from "./helpers/visualizeSave";
import {triggerSaveFileMerge} from "./helpers/triggerSaveFileMerge";

const baselineSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const legacySaveFixturePath = new URL('./fixtures/legacy-format_valid.json', import.meta.url).pathname;
const skeoUpdateSaveFixturePath = new URL('./fixtures/skeo-update_valid.json', import.meta.url).pathname;

const submergedMachinesNotification = 'Submerged machines may distort the computed available energy.';
const gameReleaseNotificationPrefix = 'Values of game release';

test.describe('Save display', () => {
  test.describe('When a valid save file is visualized', () => {
    test('should display the save configuration of that file', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('save-configuration-title')).toHaveText('Save Configuration: Merged Save (Standard)');
    });
  });

  test.describe('When a save file written in the legacy format is visualized', () => {
    test('should display it without a validation error', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('save-configuration-title')).toHaveText('Save Configuration: Merged Save (Standard)');
      await expect(page.getByTestId('display-errors-title')).toBeHidden();
    });
  });

  test.describe('When a save file written by the Skeo update is visualized', () => {
    test('should display it without a validation error, naming the planet of its placed world object Skeo and the power that object produces', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeSave(page, skeoUpdateSaveFixturePath);

      // Assert
      await expect(page.getByTestId('display-errors-title')).toBeHidden();
      await expect(page.getByTestId('energy-levels-planet-title')).toHaveText(['Skeo']);
      await expect(page.getByTestId('energy-production-item-label')).toContainText(['Wind turbine T2']);
    });

    test('should warn once, under the Power title, that submerged machines may distort the computed available energy', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeSave(page, skeoUpdateSaveFixturePath);

      // Assert
      await expect(page.getByTestId('energy-levels-title')).toHaveText('Power');
      await expect(page.getByTestId('energy-levels-notification').filter({hasText: submergedMachinesNotification})).toHaveCount(1);
    });

    test('should display the drone logistics as paused', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeSave(page, skeoUpdateSaveFixturePath);

      // Assert
      const droneLogisticsField = page.getByTestId('global-progression-field').filter({hasText: 'Drone logistics'});
      await expect(droneLogisticsField.getByTestId('global-progression-field-value')).toHaveText('Paused');
    });
  });

  test.describe('When a save file of the current game release is visualized', () => {
    test('should name no game release', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeSave(page, skeoUpdateSaveFixturePath);

      // Assert
      await expect(page.getByTestId('energy-levels-title')).toHaveText('Power');
      await expect(page.getByTestId('energy-levels-notification').filter({hasText: gameReleaseNotificationPrefix})).toHaveCount(0);
    });
  });

  test.describe('When a save file of a legacy game release is visualized', () => {
    test('should name that game release in a notification, under the submerged machines one', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeSave(page, baselineSaveFixturePath);

      // Assert
      const notifications = page.getByTestId('energy-levels-notification');
      const gameReleaseNotification = notifications.filter({hasText: gameReleaseNotificationPrefix});
      await expect(gameReleaseNotification).toHaveText('Values of game release 2.004');
      const submergedMachinesNotificationTop = (await notifications.filter({hasText: submergedMachinesNotification}).boundingBox())!.y;
      const gameReleaseNotificationTop = (await gameReleaseNotification.boundingBox())!.y;
      const firstPlanetTop = (await page.getByTestId('energy-levels-planet-title').first().boundingBox())!.y;
      expect(gameReleaseNotificationTop).toBeGreaterThan(submergedMachinesNotificationTop);
      expect(gameReleaseNotificationTop).toBeLessThan(firstPlanetTop);
    });
  });

  test.describe('When reading the chosen save file fails', () => {
    test('should report the failure and leave the form usable', async ({page}) => {
      // Arrange
      await page.addInitScript(() => {
        const refuseToRead = () => Promise.reject(new Error('The file is no longer readable.'));
        Blob.prototype.text = refuseToRead;
        Blob.prototype.arrayBuffer = refuseToRead;
        Blob.prototype.stream = () => {
          throw new Error('The file is no longer readable.');
        };
      });
      await page.goto('/');

      // Act
      await visualizeSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('display-failure-message')).toHaveText('The save file could not be displayed. Please try again.');
      await expect(page.getByTestId('save-file-input')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('visualize-button')).toBeEnabled();
    });
  });

  test.describe('When the file selection is cancelled after a save file was chosen', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      const noFileSelected: string[] = [];
      await page.goto('/');
      await page.getByTestId('save-file-input').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('save-file-input').setInputFiles(noFileSelected);

      // Assert
      await expect(page.getByTestId('visualize-button')).toBeDisabled();
    });
  });

  test.describe('When a merge produces a result while a save file is chosen for display', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByTestId('save-file-input').setInputFiles(baselineSaveFixturePath);

      // Act
      await triggerSaveFileMerge(page, baselineSaveFixturePath, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('merge-success-message')).toBeVisible();
      await expect(page.getByTestId('visualize-button')).toBeDisabled();
    });
  });
});
