import {expect, test} from '@playwright/test';

const validSaveFixturePath = new URL('./fixtures/valid-save.json', import.meta.url).pathname;

test.describe('Save display', () => {
  test.describe('When a valid save file is visualized', () => {
    test('should display the save configuration of that file', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await page.getByLabel('Save file:').setInputFiles(validSaveFixturePath);
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
    });
  });

  test.describe('When reading the chosen save file fails', () => {
    test('should report the failure and leave the form usable', async ({page}) => {
      // Arrange
      await page.addInitScript(() => {
        File.prototype.text = () => Promise.reject(new Error('The file is no longer readable.'));
      });
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(validSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByText('The save file could not be displayed. Please try again.')).toBeVisible();
      await expect(page.getByLabel('Save file:')).toHaveValue(/valid-save\.json$/);
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeEnabled();
    });
  });

  test.describe('When the file selection is cancelled after a save file was chosen', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      const noFileSelected: string[] = [];
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(validSaveFixturePath);

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
      await page.getByLabel('Save file:').setInputFiles(validSaveFixturePath);
      await page.getByLabel('Save A:').setInputFiles(validSaveFixturePath);
      await page.getByLabel('Save B:').setInputFiles(validSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Merge'}).click();

      // Assert
      await expect(page.getByText('Merge successful!')).toBeVisible();
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeDisabled();
    });
  });
});
