import {expect, test} from './scenarioTest';
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
      await visualizeAndRevealTheMessages(page, invalidSaveFixturePath, 'display-errors');

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
      await expect(page.getByTestId('loaded-save-title')).toBeHidden();
    });
  });

  test.describe('When an invalid save file is merged with a valid one', () => {
    test('should name the rejected input and locate its errors, without offering a download', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await mergeAndRevealTheMessages(page, invalidSaveFixturePath, validSaveFixturePath, 'save-a-errors');

      // Assert
      await expect(page.getByTestId('save-a-errors-title')).toHaveText('Save A is not a valid save file.');
      await expect(page.getByTestId('save-a-errors-messages')).toContainText(errorLocationInTheSave);
      await expect(page.getByTestId('download-link')).toBeHidden();
    });
  });
});
