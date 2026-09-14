import {expect, test, type Page} from '@playwright/test';

const invalidSaveFixturePath = new URL('./fixtures/negative-gauge_invalid.json', import.meta.url).pathname;
const validSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;

/**
 * Where in the save the error of `negative-gauge_invalid.json` sits, as the screen prints it under
 * the message. A scenario asserts the located frame the screen shows, never which rule decided the
 * save was invalid: that ground is covered in core-mapping.
 */
const errorLocationInTheSave = 'at Players (section 2), entry 0';

/** The messages of a list stay collapsed until the reader asks for them. */
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
  await page.getByText(revealMessagesLabel).click();
}

test.describe('Save validation errors', () => {
  test.describe('When an invalid save file is visualized', () => {
    test('should list the errors and say where in the save each one was found', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeAndRevealTheMessages(page, invalidSaveFixturePath);

      // Assert
      await expect(page.getByText('Errors', {exact: true})).toBeVisible();
      await expect(page.getByRole('listitem')).toContainText(errorLocationInTheSave);
    });

    test('should leave the save data unrendered', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(invalidSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByText('Errors', {exact: true})).toBeVisible();
      await expect(page.getByRole('heading', {name: 'Save Configuration:'})).toBeHidden();
    });
  });

  test.describe('When an invalid save file is merged with a valid one', () => {
    test('should name the rejected input and locate its errors, without offering a download', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await mergeAndRevealTheMessages(page, invalidSaveFixturePath, validSaveFixturePath);

      // Assert
      await expect(page.getByText('Save A is not a valid save file.')).toBeVisible();
      await expect(page.getByRole('listitem')).toContainText(errorLocationInTheSave);
      await expect(page.getByRole('link', {name: 'Download'})).toBeHidden();
    });
  });
});
