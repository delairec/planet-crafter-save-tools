import {expect, test} from '@playwright/test';
import {findTheMenu, visualizeTheSave} from './saveManagerShell';

const baselineSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const legacySaveFixturePath = new URL('./fixtures/legacy-format_valid.json', import.meta.url).pathname;
const invalidSaveFixturePath = new URL('./fixtures/negative-gauge_invalid.json', import.meta.url).pathname;

test.describe('Overview page', () => {
  test.describe('When no save is loaded', () => {
    test('should offer the display area, its file input and its Visualize button', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByRole('group', {name: 'Display a save\'s data'})).toBeVisible();
      await expect(page.getByLabel('Save file:')).toBeVisible();
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeDisabled();
    });
  });

  test.describe('When a valid save file is visualized', () => {
    test('should name the file and offer the pages of the Save group', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByRole('heading', {name: 'Loaded save: baseline_valid.json'})).toBeVisible();
      await expect(page.getByRole('main').getByRole('link')).toHaveText(['Configuration', 'Power', 'Terraformation']);
    });
  });

  test.describe('When a save file written in the legacy format is visualized', () => {
    test('should load it without a validation error', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByRole('heading', {name: 'Loaded save: legacy-format_valid.json'})).toBeVisible();
      await expect(page.getByText('Errors', {exact: true})).toBeHidden();
    });

    test('should show its warnings above the content of the page', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByRole('heading', {name: 'Loaded save: legacy-format_valid.json'})).toBeVisible();
      const warningsTop = (await page.getByText('Warnings', {exact: true}).boundingBox())!.y;
      const loadedSaveTop = (await page.getByRole('heading', {name: 'Loaded save: legacy-format_valid.json'}).boundingBox())!.y;
      expect(warningsTop).toBeLessThan(loadedSaveTop);
    });
  });

  test.describe('When an invalid save file is visualized', () => {
    test('should list its errors and keep the Save and Players groups out of the menu', async ({page}) => {
      // Act
      await visualizeTheSave(page, invalidSaveFixturePath);

      // Assert
      await expect(page.getByText('Errors', {exact: true})).toBeVisible();
      await expect(findTheMenu(page).getByRole('group')).toHaveAccessibleName('Tools');
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
      await page.getByLabel('Save file:').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByText('The save file could not be displayed. Please try again.')).toBeVisible();
      await expect(page.getByLabel('Save file:')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeEnabled();
    });
  });

  test.describe('When the file selection is cancelled after a save file was chosen', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      const noFileSelected: string[] = [];
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByLabel('Save file:').setInputFiles(noFileSelected);

      // Assert
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeDisabled();
    });
  });

  test.describe('When a merge produces a result while a save file is chosen for display', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(baselineSaveFixturePath);
      await page.getByLabel('Save A:').setInputFiles(baselineSaveFixturePath);
      await page.getByLabel('Save B:').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Merge'}).click();

      // Assert
      await expect(page.getByText('Merge successful!')).toBeVisible();
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeDisabled();
    });
  });
});
