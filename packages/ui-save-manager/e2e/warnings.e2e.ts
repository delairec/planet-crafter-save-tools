import {expect, test, type Page} from '@playwright/test';

const legacySaveFixturePath = new URL('./fixtures/legacy-format_valid.json', import.meta.url).pathname;
const currentFormatSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;

const legacyFormatWarningFragment = 'written by version 1.618 of the game or earlier';
const legacyFormatWarningCode = 'legacy-save-format';
const revealMessagesLabel = 'Show details';

async function visualizeAndRevealTheMessages(page: Page, saveFixturePath: string): Promise<void> {
  await page.getByLabel('Save file:').setInputFiles(saveFixturePath);
  await page.getByRole('button', {name: 'Visualize'}).click();
  await page.getByText(revealMessagesLabel).click();
}

async function mergeAndRevealTheMessages(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);
  await page.getByLabel('Save B:').setInputFiles(saveBFixturePath);
  await page.getByRole('button', {name: 'Merge'}).click();
  await page.getByText(revealMessagesLabel).first().click();
}

test.describe('Save warnings', () => {
  test.describe('When a save file raising a warning is visualized', () => {
    test('should give the reader a sentence rather than the code the warning travels as', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeAndRevealTheMessages(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByText('Warnings', {exact: true})).toBeVisible();
      await expect(page.getByRole('listitem')).toContainText(legacyFormatWarningFragment);
      await expect(page.getByRole('listitem')).not.toContainText(legacyFormatWarningCode);
    });

    test('should render the save data all the same, a warning not making the save unusable', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(legacySaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByText('Warnings', {exact: true})).toBeVisible();
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
    });
  });

  test.describe('When a save file raising a warning is merged with a save file raising none', () => {
    test('should attribute the warning to the input that raised it and still produce a file', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await mergeAndRevealTheMessages(page, legacySaveFixturePath, currentFormatSaveFixturePath);

      // Assert
      await expect(page.getByText('Save A warnings')).toBeVisible();
      await expect(page.getByText('Save B warnings')).toBeHidden();
      await expect(page.getByRole('listitem').first()).toContainText(legacyFormatWarningFragment);
      await expect(page.getByRole('link', {name: 'Download'})).toBeVisible();
    });
  });
});
