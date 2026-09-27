import {expect, type Page, test} from '@playwright/test';
import {visualizeSave} from "./helpers/visualizeSave";
import {triggerSaveFileMerge} from "./helpers/triggerSaveFileMerge";

const legacySaveFixturePath = new URL('./fixtures/legacy-format_valid.json', import.meta.url).pathname;
const currentFormatSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;

const legacyFormatWarningFragment = 'written by version 1.618 of the game or earlier';
const legacyFormatWarningCode = 'legacy-save-format';

async function visualizeAndRevealTheMessages(page: Page, saveFixturePath: string): Promise<void> {
  await visualizeSave(page, saveFixturePath);
  await page.getByTestId('display-warnings-details-toggle').click();
}

async function mergeAndRevealTheMessages(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);
  await page.getByTestId('save-a-warnings-details-toggle').click();
}

test.describe('Save warnings', () => {
  test.describe('When a save file raising a warning is visualized', () => {
    test('should give the reader a sentence rather than the code the warning travels as', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeAndRevealTheMessages(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('display-warnings-title')).toHaveText('Warnings');
      await expect(page.getByTestId('display-warnings-messages')).toContainText(legacyFormatWarningFragment);
      await expect(page.getByTestId('display-warnings-messages')).not.toContainText(legacyFormatWarningCode);
    });

    test('should render the save data all the same, a warning not making the save unusable', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeSave(page, legacySaveFixturePath);


      // Assert
      await expect(page.getByTestId('display-warnings-title')).toHaveText('Warnings');
      await expect(page.getByTestId('save-configuration-title')).toHaveText('Save Configuration: Merged Save (Standard)');
    });
  });

  test.describe('When a save file raising a warning is merged with a save file raising none', () => {
    test('should attribute the warning to the input that raised it and still produce a file', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await mergeAndRevealTheMessages(page, legacySaveFixturePath, currentFormatSaveFixturePath);

      // Assert
      await expect(page.getByTestId('save-a-warnings-title')).toHaveText('Save A warnings');
      await expect(page.getByTestId('save-b-warnings-title')).toBeHidden();
      await expect(page.getByTestId('save-a-warnings-messages')).toContainText(legacyFormatWarningFragment);
      await expect(page.getByTestId('download-link')).toBeVisible();
    });
  });
});
