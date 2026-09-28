import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

test.describe('Home page', () => {
  test.describe('When the root address is opened before a save is loaded', () => {
    test('should open the home page without the menu', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('home-page')).toBeVisible();
      await expect(page.getByTestId('page-navigation')).toHaveCount(0);
      await expect(page).toHaveURL(/:\d+\/$/);
    });

    test('should keep the disclaimers of the other pages', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('disclaimers')).toBeVisible();
    });

    test('should say what the tool does', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('home-page-description')).toHaveText(/^[A-Z].+\.$/);
    });

    test('should offer the Merge two saves and Load save pages', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId(/^home-[a-z-]+-page-link$/)).toHaveText(['Merge two saves', 'Load save']);
      await expect(page.getByTestId('home-loaded-save')).toHaveCount(0);
    });
  });

  test.describe('When a page is opened from the home page', () => {
    test('should open the Merge two saves page', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await page.getByTestId('home-merge-two-saves-page-link').click();

      // Assert
      await expect(page).toHaveURL(/\/merge$/);
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Tools', 'Merge two saves']);
    });

    test('should open the Load save page', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await page.getByTestId('home-load-save-page-link').click();

      // Assert
      await expect(page).toHaveURL(/\/load-save$/);
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Tools', 'Load save']);
    });
  });

  test.describe('When the root address is opened once a save is loaded', () => {
    test('should name the Load save page Load another save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(page.getByTestId(/^home-[a-z-]+-page-link$/)).toHaveText(['Merge two saves', 'Load another save']);
    });

    test('should show the card of the loaded save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(page.getByTestId('home-loaded-save').getByTestId('save-identity-file-name')).toHaveText('baseline_valid.json');
      await expect(page.getByTestId('home-loaded-save').getByTestId('save-identity-display-name')).toHaveText('Merged Save');
      await expect(page.getByTestId('home-loaded-save').getByTestId('save-identity-mode')).toHaveText('Standard');
      await expect(page.getByTestId('home-loaded-save').getByTestId('save-identity-game-release')).toHaveText('Game release 2.004');
    });

    test('should open the Overview page of the loaded save from its card', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('application-title-link').click();

      // Act
      await page.getByTestId('home-overview-link').click();

      // Assert
      await expect(page).toHaveURL(/\/overview$/);
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
    });
  });

  test.describe('When the title of the application is clicked on another page', () => {
    test('should open the home page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Configuration');

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(page).toHaveURL(/:\d+\/$/);
      await expect(page.getByTestId('home-page')).toBeVisible();
    });
  });
});
