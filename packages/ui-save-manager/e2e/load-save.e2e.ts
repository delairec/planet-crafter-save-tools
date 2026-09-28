import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, findTheMenu, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const otherPlayerSaveFixturePath = locateTheFixture('other-player_valid.json');
const invalidSaveFixturePath = locateTheFixture('negative-gauge_invalid.json');

test.describe('Load save page', () => {
  test.describe('When its own address is opened before a save is loaded', () => {
    test('should open the Load save page', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page).toHaveURL(/\/load-save$/);
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Tools', 'Load save']);
    });

    test('should mark Load save as the current page of the menu', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(findTheMenu(page).getByTestId('load-save-page-link')).toHaveText('Load save');
      await expect(findTheMenu(page).getByTestId('load-save-page-link')).toHaveAttribute('aria-current', 'page');
    });
  });

  test.describe('When a valid save is visualized', () => {
    test('should open the Overview page at its own address', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
      await expect(page).toHaveURL(/\/overview$/);
    });
  });

  test.describe('When it is opened from the menu', () => {
    test('should open on a breadcrumb naming the Tools group and the Load another save page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Load another save');

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Tools', 'Load another save']);
      await expect(page).toHaveURL(/\/load-save$/);
    });

    test('should offer nothing to visualize before a file is picked on it', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Load another save');

      // Assert
      await expect(page.getByTestId('visualize')).toBeDisabled();
    });
  });

  test.describe('When another save is visualized while a save is loaded', () => {
    test('should open the Overview page on the new save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Load another save');
      await page.getByTestId('save-file').setInputFiles(otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('visualize').click();

      // Assert
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: other-player_valid.json');
      await expect(findTheBreadcrumbSteps(page)).toHaveCount(0);
    });
  });

  test.describe('When another save is picked but not visualized while a save is loaded', () => {
    test('should keep the loaded save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Load another save');
      await page.getByTestId('save-file').setInputFiles(otherPlayerSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Overview');

      // Assert
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
    });
  });

  test.describe('When an invalid save is visualized while a save is loaded', () => {
    test('should list its errors and keep the loaded save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Load another save');
      await page.getByTestId('save-file').setInputFiles(invalidSaveFixturePath);

      // Act
      await page.getByTestId('visualize').click();

      // Assert
      await expect(page.getByTestId('display-errors-title')).toHaveText('Errors');
      await openThePageOfTheMenu(page, 'Overview');
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
    });
  });
});
