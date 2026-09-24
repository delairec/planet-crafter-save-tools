import {expect, test} from '@playwright/test';

const baselineSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const legacySaveFixturePath = new URL('./fixtures/legacy-format_valid.json', import.meta.url).pathname;
const skeoUpdateSaveFixturePath = new URL('./fixtures/skeo-update_valid.json', import.meta.url).pathname;

test.describe('Save display', () => {
  test.describe('When a valid save file is visualized', () => {
    test('should display the save configuration of that file', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
    });
  });

  test.describe('When a save file written in the legacy format is visualized', () => {
    test('should display it without a validation error', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(legacySaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
      await expect(page.getByText('Errors', {exact: true})).toBeHidden();
    });
  });

  test.describe('When a save file written by the Skeo update is visualized', () => {
    test('should display it without a validation error, naming the planet of its placed world object Skeo and the power that object produces', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(skeoUpdateSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByText('Errors', {exact: true})).toBeHidden();
      await expect(page.getByRole('heading', {name: 'Skeo', level: 4})).toBeVisible();
      await expect(page.getByText('Wind turbine T2')).toBeVisible();
    });

    test('should display the drone logistics as paused', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(skeoUpdateSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByText('Drone logistics')).toBeVisible();
      await expect(page.getByText('Paused', {exact: true})).toBeVisible();
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
