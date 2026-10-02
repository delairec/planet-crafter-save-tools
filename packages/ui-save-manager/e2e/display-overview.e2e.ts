import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, findTheMenuGroupTitles, locateTheFixture, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');
const skeoUpdateSaveFixturePath = locateTheFixture('skeo-update_valid.json');
const invalidSaveFixturePath = locateTheFixture('negative-gauge_invalid.json');

test.describe('Overview page', () => {
  test.describe('When no save is loaded', () => {
    test('should offer the display area, its file input and its Visualize button', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page.getByTestId('display-area')).toBeVisible();
      await expect(page.getByTestId('save-file')).toBeVisible();
      await expect(page.getByTestId('visualize')).toBeDisabled();
    });
  });

  test.describe('When a valid save file is visualized', () => {
    test('should title the page with the display name of the save, its mode, its game release and its file size beside it', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-identity-title')).toHaveText('Merged Save');
      await expect(page.getByTestId('overview-identity-title-hint')).toHaveText('Standard · Game release 2.004 · 2.48 KB');
    });

    test('should show the progression tiles the save carries', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-all-time-terra-tokens-value')).toHaveText('200,345=tt=');
      await expect(page.getByTestId('overview-total-crafted-objects-value')).toHaveText('10');
      await expect(page.getByTestId('overview-drone-logistics')).toBeHidden();
    });

    test('should read Overview alone in the breadcrumb and leave the pages of the save to the menu', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Overview']);
      await expect(page.getByTestId(/^overview-[a-z]+-page-link$/)).toHaveCount(0);
    });
  });

  test.describe('When a save written by the Skeo update is visualized', () => {
    test('should show the drone logistics as a Paused badge penalising the player', async ({page}) => {
      // Act
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-drone-logistics-badge')).toContainText('Paused');
      await expect(page.getByTestId('overview-drone-logistics-badge-tone')).toHaveText(', penalises the player');
    });
  });

  test.describe('When a save file written in the legacy format is visualized', () => {
    test('should load it without a validation error', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-identity-title-hint')).toHaveText('Standard · Game release 1.618 · 2.623 KB');
      await expect(page.getByTestId('display-errors-title')).toBeHidden();
    });

    test('should show its warnings above the content of the page', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-identity-title')).toHaveText('Merged Save');
      const warningsTop = (await page.getByTestId('display-warnings-title').boundingBox())!.y;
      const identityTitleTop = (await page.getByTestId('overview-identity-title').boundingBox())!.y;
      expect(warningsTop).toBeLessThan(identityTitleTop);
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
      await page.goto('/load-save');
      await page.getByTestId('save-file').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('visualize').click();

      // Assert
      await expect(page.getByTestId('display-failure-message')).toHaveText('The save file could not be displayed. Please try again.');
      await expect(page.getByTestId('save-file')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('visualize')).toBeEnabled();
    });
  });

  test.describe('When the file selection is cancelled after a save file was chosen', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      const noFileSelected: string[] = [];
      await page.goto('/load-save');
      await page.getByTestId('save-file').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('save-file').setInputFiles(noFileSelected);

      // Assert
      await expect(page.getByTestId('visualize')).toBeDisabled();
    });
  });
});
