import {expect, type Page, test} from '@playwright/test';
import {visualizeSave} from "./helpers/visualizeSave";
import {triggerSaveFileMerge} from "./helpers/triggerSaveFileMerge";

const invalidSaveFixturePath = new URL('./fixtures/negative-gauge_invalid.json', import.meta.url).pathname;
const validSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;

const errorLocationInTheSave = 'at Players (section 2), entry 0';

async function visualizeAndRevealTheMessages(page: Page, saveFixturePath: string): Promise<void> {
  await visualizeSave(page, saveFixturePath);
  await page.getByTestId('display-errors-details-toggle').click();
}

async function mergeAndRevealTheMessages(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath)
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

      // Act
      await visualizeSave(page, invalidSaveFixturePath);

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
