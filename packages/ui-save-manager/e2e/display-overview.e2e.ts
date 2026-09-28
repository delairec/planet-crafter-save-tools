import {expect, test} from './scenarioTest';
import {triggerSaveFileMerge} from './helpers/triggerSaveFileMerge';
import {findTheMenuGroupTitles, locateTheFixture, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');
const invalidSaveFixturePath = locateTheFixture('negative-gauge_invalid.json');

test.describe('Overview page', () => {
  test.describe('When no save is loaded', () => {
    test('should offer the display area, its file input and its Visualize button', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('display-area')).toBeVisible();
      await expect(page.getByTestId('save-file-input')).toBeVisible();
      await expect(page.getByTestId('visualize-button')).toBeDisabled();
    });
  });

  test.describe('When a valid save file is visualized', () => {
    test('should name the file and offer the pages of the Save group', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
      await expect(page.getByTestId(/-overview-link$/)).toHaveText(['Configuration', 'Power', 'Terraformation']);
    });
  });

  test.describe('When a save file written in the legacy format is visualized', () => {
    test('should load it without a validation error', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: legacy-format_valid.json');
      await expect(page.getByTestId('display-errors-title')).toBeHidden();
    });

    test('should show its warnings above the content of the page', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: legacy-format_valid.json');
      const warningsTop = (await page.getByTestId('display-warnings-title').boundingBox())!.y;
      const loadedSaveTop = (await page.getByTestId('loaded-save-title').boundingBox())!.y;
      expect(warningsTop).toBeLessThan(loadedSaveTop);
    });
  });

  test.describe('When an invalid save file is visualized', () => {
    test('should list its errors and keep the Save and Players groups out of the menu', async ({page}) => {
      // Act
      await visualizeTheSave(page, invalidSaveFixturePath);

      // Assert
      await expect(page.getByTestId('display-errors-title')).toHaveText('Errors');
      await expect(findTheMenuGroupTitles(page)).toHaveText(['Tools']);
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
      await page.getByTestId('save-file-input').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('visualize-button').click();

      // Assert
      await expect(page.getByTestId('display-failure-message')).toHaveText('The save file could not be displayed. Please try again.');
      await expect(page.getByTestId('save-file-input')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('visualize-button')).toBeEnabled();
    });
  });

  test.describe('When the file selection is cancelled after a save file was chosen', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      const noFileSelected: string[] = [];
      await page.goto('/');
      await page.getByTestId('save-file-input').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('save-file-input').setInputFiles(noFileSelected);

      // Assert
      await expect(page.getByTestId('visualize-button')).toBeDisabled();
    });
  });

  test.describe('When a merge produces a result while a save file is chosen for display', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByTestId('save-file-input').setInputFiles(baselineSaveFixturePath);

      // Act
      await triggerSaveFileMerge(page, baselineSaveFixturePath, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('merge-success-message')).toBeVisible();
      await expect(page.getByTestId('visualize-button')).toBeDisabled();
    });
  });
});
