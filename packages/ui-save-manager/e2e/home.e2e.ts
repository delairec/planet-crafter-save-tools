import {expect, test} from './scenarioTest';
import {type Locator, type Page} from '@playwright/test';
import {chooseTheTwoSavesToMerge, findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const otherPlayerSaveFixturePath = locateTheFixture('other-player_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');

async function mergeTwoSaves(page: Page, saveAFixturePath: string, saveBFixturePath: string): Promise<void> {
  await chooseTheTwoSavesToMerge(page, saveAFixturePath, saveBFixturePath);
  await page.getByTestId('merge').click();
  await expect(page.getByTestId('merge-success-message')).toBeVisible();
}

async function mergeTwoPairsOfSaves(page: Page): Promise<void> {
  await page.goto('/merge');
  await mergeTwoSaves(page, baselineSaveFixturePath, otherPlayerSaveFixturePath);
  await mergeTwoSaves(page, baselineSaveFixturePath, legacySaveFixturePath);
}

function findTheAttachedMergedSaves(page: Page): Locator {
  return page.getByTestId('home-message').getByTestId(/^home-merged-save-download-\d+$/);
}

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

    test('should say what the tool does in a message from SENTINEL CORP', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('home-message-title')).toHaveText('Message');
      await expect(page.getByTestId('home-page-description')).toHaveText(/^Welcome to the Planet Crafter Save Manager, prisoner\..+merge two saves.+validate your save integrity\.$/);
      await expect(page.getByTestId('home-message-closing')).toHaveText('Keep up the good work!');
      await expect(page.getByTestId('home-message-sender')).toHaveText('SENTINEL CORP');
    });

    test('should offer the Merge two saves and Load save pages', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId(/^home-[a-z-]+-page-link$/)).toHaveText(['Merge two saves', 'Load save']);
      await expect(page.getByTestId('home-loaded-save')).toHaveCount(0);
    });

    test('should attach no merged save to the message', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('home-merged-saves')).toHaveCount(0);
    });
  });

  test.describe('When the home page is opened once merged saves are kept', () => {
    test('should attach the merged saves to the message, newest first', async ({page}) => {
      // Arrange
      await mergeTwoPairsOfSaves(page);

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(findTheAttachedMergedSaves(page)).toHaveText([
        'baseline_valid-legacy-format_valid-merged.json',
        'baseline_valid-other-player_valid-merged.json'
      ]);
    });

    test('should offer each attached merged save for download under its name', async ({page}) => {
      // Arrange
      await mergeTwoPairsOfSaves(page);
      await page.getByTestId('application-title-link').click();
      const downloadStarted = page.waitForEvent('download');

      // Act
      await page.getByTestId('home-merged-save-download-1').click();

      // Assert
      expect((await downloadStarted).suggestedFilename()).toBe('baseline_valid-other-player_valid-merged.json');
    });

    test('should name the cross of each attached merged save after it', async ({page}) => {
      // Arrange
      await mergeTwoPairsOfSaves(page);

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(page.getByTestId('home-merged-save-remove-0')).toHaveAccessibleName('Remove baseline_valid-legacy-format_valid-merged.json');
      await expect(page.getByTestId('home-merged-save-remove-1')).toHaveAccessibleName('Remove baseline_valid-other-player_valid-merged.json');
    });
  });

  test.describe('When an earlier merged save is removed from the message', () => {
    test('should detach it from the message', async ({page}) => {
      // Arrange
      await mergeTwoPairsOfSaves(page);
      await page.getByTestId('application-title-link').click();

      // Act
      await page.getByTestId('home-merged-save-remove-1').click();

      // Assert
      await expect(findTheAttachedMergedSaves(page)).toHaveText(['baseline_valid-legacy-format_valid-merged.json']);
    });

    test('should no longer list it on the Merge two saves page, the last merge result kept', async ({page}) => {
      // Arrange
      await mergeTwoPairsOfSaves(page);
      await page.getByTestId('application-title-link').click();
      await page.getByTestId('home-merged-save-remove-1').click();

      // Act
      await page.getByTestId('home-merge-two-saves-page-link').click();

      // Assert
      await expect(page.getByTestId('merged-file-name')).toHaveText('baseline_valid-legacy-format_valid-merged.json');
      await expect(page.getByTestId('earlier-merged-saves')).toHaveCount(0);
    });
  });

  test.describe('When the merged save of the last merge result is removed from the message', () => {
    test('should clear the last merge result of the Merge two saves page, the earlier merged saves kept', async ({page}) => {
      // Arrange
      await mergeTwoPairsOfSaves(page);
      await page.getByTestId('application-title-link').click();
      await page.getByTestId('home-merged-save-remove-0').click();

      // Act
      await page.getByTestId('home-merge-two-saves-page-link').click();

      // Assert
      await expect(page.getByTestId('merge-success-message')).toHaveCount(0);
      await expect(page.getByTestId(/^earlier-merged-save-file-name-\d+$/)).toHaveText(['baseline_valid-other-player_valid-merged.json']);
    });
  });

  test.describe('When the last attached merged save is removed from the message', () => {
    test('should leave no attachment in the message', async ({page}) => {
      // Arrange
      await page.goto('/merge');
      await mergeTwoSaves(page, baselineSaveFixturePath, otherPlayerSaveFixturePath);
      await page.getByTestId('application-title-link').click();

      // Act
      await page.getByTestId('home-merged-save-remove-0').click();

      // Assert
      await expect(page.getByTestId('home-merged-saves')).toHaveCount(0);
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

    test('should hold the button links and the card of the loaded save in the message', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(page.getByTestId('home-message').getByTestId(/^home-[a-z-]+-page-link$/)).toHaveCount(2);
      await expect(page.getByTestId('home-message').getByTestId('home-loaded-save').getByTestId('home-overview-link')).toBeVisible();
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

  test.describe('When the loaded save is unloaded from its card', () => {
    test('should name its cross Unload save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(page.getByTestId('home-loaded-save').getByTestId('unload-save')).toHaveAccessibleName('Unload save');
    });

    test('should forget the save and show the home page of no save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('application-title-link').click();

      // Act
      await page.getByTestId('unload-save').click();

      // Assert
      await expect(page.getByTestId('home-loaded-save')).toHaveCount(0);
      await expect(page.getByTestId(/^home-[a-z-]+-page-link$/)).toHaveText(['Merge two saves', 'Load save']);
    });

    test('should leave no save to open on the Overview page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('application-title-link').click();
      await page.getByTestId('unload-save').click();

      // Act
      await page.goto('/overview');

      // Assert
      await expect(page).toHaveURL(/\/load-save$/);
    });

    test('should keep the merged saves attached to the message', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Merge two saves');
      await mergeTwoSaves(page, baselineSaveFixturePath, otherPlayerSaveFixturePath);
      await page.getByTestId('application-title-link').click();

      // Act
      await page.getByTestId('unload-save').click();

      // Assert
      await expect(findTheAttachedMergedSaves(page)).toHaveText(['baseline_valid-other-player_valid-merged.json']);
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
