import {expect, test} from '@playwright/test';
import {locateTheFixture, mergeAndRevealTheMessages, visualizeAndRevealTheMessages} from './scenarioSteps';

const invalidSaveFixturePath = locateTheFixture('negative-gauge_invalid.json');
const validSaveFixturePath = locateTheFixture('baseline_valid.json');

const errorLocationInTheSave = 'at Players (section 2), entry 0';

test.describe('Save validation errors', () => {
  test.describe('When an invalid save file is visualized', () => {
    test('should list the errors and say where in the save each one was found', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeAndRevealTheMessages(page, invalidSaveFixturePath);

      // Assert
      await expect(page.getByText('Errors', {exact: true})).toBeVisible();
      await expect(page.getByTestId('display-errors-messages')).toContainText(errorLocationInTheSave);
    });

    test('should leave the save data unrendered', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(invalidSaveFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByText('Errors', {exact: true})).toBeVisible();
      await expect(page.getByRole('heading', {name: 'Loaded save:'})).toBeHidden();
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
