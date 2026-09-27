import {expect, test, type Page} from '@playwright/test';

const invalidSaveFixturePath = new URL('./fixtures/negative-gauge_invalid.json', import.meta.url).pathname;
const validSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;

const errorLocationInTheSave = 'at Players (section 2), entry 0';

async function visualizeAndRevealTheMessages(page: Page, saveFixturePath: string): Promise<void> {
  await page.getByTestId('save-file-input').setInputFiles(saveFixturePath);
  await page.getByTestId('visualize-button').click();
  await page.getByTestId('display-errors-details-toggle').click();
}

async function mergeAndRevealTheMessages(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await page.getByTestId('save-a-input').setInputFiles(saveAFixturePath);
  await page.getByTestId('save-b-input').setInputFiles(saveBFixturePath);
  await page.getByTestId('merge-button').click();
  await page.getByTestId('save-a-errors-details-toggle').click();
}

test.describe('Save validation errors', () => {
  test.describe('When an invalid save file is visualized', () => {
    test('should list the errors and say where in the save each one was found', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeAndRevealTheMessages(page, invalidSaveFixturePath);

      // Assert
      await expect(page.getByTestId('display-errors-title')).toHaveText('Errors');
      await expect(page.getByTestId('display-errors-messages')).toContainText(errorLocationInTheSave);
    });

    test('should leave the save data unrendered', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByTestId('save-file-input').setInputFiles(invalidSaveFixturePath);

      // Act
      await page.getByTestId('visualize-button').click();

      // Assert
      await expect(page.getByTestId('display-errors-title')).toHaveText('Errors');
      await expect(page.getByTestId('save-configuration-title')).toBeHidden();
    });
  });

  test.describe('When an invalid save file is merged with a valid one', () => {
    test('should name the rejected input and locate its errors, without offering a download', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await mergeAndRevealTheMessages(page, invalidSaveFixturePath, validSaveFixturePath);

      // Assert
      await expect(page.getByTestId('save-a-errors-title')).toHaveText('Save A is not a valid save file.');
      await expect(page.getByTestId('save-a-errors-messages')).toContainText(errorLocationInTheSave);
      await expect(page.getByTestId('download-link')).toBeHidden();
    });
  });
});
