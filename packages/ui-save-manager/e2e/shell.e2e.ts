import {type Locator, type Page} from '@playwright/test';
import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, findTheMenu, findTheMenuGroupTitles, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');

type ShellPart = 'title' | 'disclaimers' | 'page' | 'footer';

async function readTheShellPartsFromTopToBottom(page: Page, pageContentTestId: string): Promise<ShellPart[]> {
  const partLocators: [ShellPart, Locator][] = [
    ['title', page.getByTestId('application-title')],
    ['disclaimers', page.getByTestId('disclaimers-toggle')],
    ['page', page.getByTestId(pageContentTestId)],
    ['footer', page.getByTestId('application-version')]
  ];
  const partTops = await Promise.all(partLocators.map(async ([part, locator]) => ({part, top: (await locator.boundingBox())!.y})));

  return partTops.sort((first, second) => first.top - second.top).map(({part}) => part);
}

async function holdEveryFurtherFileRead(page: Page): Promise<void> {
  await page.evaluate(() => {
    const neverReleased = new Promise<never>(() => {});
    Blob.prototype.text = () => neverReleased;
    Blob.prototype.arrayBuffer = () => neverReleased;
    Blob.prototype.stream = () => new ReadableStream({start: () => neverReleased});
  });
}

function recordTheDocumentLoads(page: Page): string[] {
  const loadedDocumentUrls: string[] = [];
  page.on('load', () => loadedDocumentUrls.push(page.url()));

  return loadedDocumentUrls;
}

test.describe('Save manager shell', () => {
  test.describe('When the Overview page is opened', () => {
    test('should show the disclaimers under the title, above the page and above the version footer', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      const shellParts = await readTheShellPartsFromTopToBottom(page, 'display-area');

      // Assert
      expect(shellParts).toEqual(['title', 'disclaimers', 'page', 'footer']);
    });

    test('should offer the Tools group alone, holding Merge two saves and Load another save', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(findTheMenuGroupTitles(page)).toHaveText(['Tools']);
      await expect(findTheMenu(page).getByTestId(/-menu-link$/)).toHaveText(['Merge two saves', 'Load another save']);
    });
  });

  test.describe('When a save is loaded', () => {
    test('should show the Tools, Save and Players groups of the menu in that order', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(findTheMenuGroupTitles(page)).toHaveText(['Tools', 'Save', 'Players']);
    });

    test('should offer the Overview, Configuration, Power and Terraformation pages in the Save group', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('save-menu-group').getByTestId(/-menu-link$/))
        .toHaveText(['Overview', 'Configuration', 'Power', 'Terraformation']);
    });

    test('should end the Players group on a See more button', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      const playersGroup = page.getByTestId('players-menu-group');
      const seeMoreButton = playersGroup.getByTestId('see-more-players-button');
      await expect(seeMoreButton).toHaveText('See more');
      expect((await seeMoreButton.boundingBox())!.y)
        .toBeGreaterThan((await playersGroup.getByTestId(/^menu-player-\d+$/).last().boundingBox())!.y);
    });

    test('should show the save identity above the groups', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      const identityZone = page.getByTestId('save-identity');
      await expect(identityZone.getByTestId('save-identity-file-name')).toHaveText('baseline_valid.json');
      await expect(identityZone.getByTestId('save-identity-display-name')).toHaveText('Merged Save');
      await expect(identityZone.getByTestId('save-identity-mode')).toHaveText('Standard');
      await expect(identityZone.getByTestId('save-identity-game-release')).toHaveText('Game release 2.004');
      expect((await identityZone.boundingBox())!.y)
        .toBeLessThan((await page.getByTestId('save-menu-group').boundingBox())!.y);
    });

    test('should list the players in the Players group', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('players-menu-group').getByTestId(/^menu-player-\d+$/))
        .toHaveText(['NikowaHostToxicity']);
    });
  });

  test.describe('When a legacy save is loaded', () => {
    test('should list its players with the planet they stand on', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('players-menu-group').getByTestId(/^menu-player-\d+$/))
        .toHaveText(['NikowaHostToxicity']);
    });
  });

  test.describe('When a page of the save is opened', () => {
    test('should show the disclaimers under the title, above the page and above the version footer', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Configuration');

      // Act
      const shellParts = await readTheShellPartsFromTopToBottom(page, 'global-progression-title');

      // Assert
      expect(shellParts).toEqual(['title', 'disclaimers', 'page', 'footer']);
    });
  });

  test.describe('When the reader switches from page to page', () => {
    test('should keep the loaded save without reading its file again nor reloading the page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
      await holdEveryFurtherFileRead(page);
      const loadedDocumentUrls = recordTheDocumentLoads(page);
      await openThePageOfTheMenu(page, 'Power');

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId('save-configuration-title')).toHaveText('Save Configuration: Merged Save (Standard)');
      expect(loadedDocumentUrls).toEqual([]);
    });
  });

  test.describe('When a page of the save is requested with no save loaded', () => {
    test('should open the Overview page', async ({page}) => {
      // Act
      await page.goto('/configuration');

      // Assert
      await expect(page.getByTestId('display-area')).toBeVisible();
      await expect(findTheBreadcrumbSteps(page)).toHaveCount(0);
    });
  });

  test.describe('When Merge two saves is chosen in the menu of a page of the save', () => {
    test('should lead to the merge form', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Configuration');

      // Act
      await openThePageOfTheMenu(page, 'Merge two saves');

      // Assert
      await expect(page.getByTestId('save-a-input')).toBeVisible();
    });
  });

  test.describe('When Load another save is chosen in the menu of a page of the save', () => {
    test('should lead to the file input of the display area', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Configuration');

      // Act
      await openThePageOfTheMenu(page, 'Load another save');

      // Assert
      await expect(page.getByTestId('save-file-input')).toBeVisible();
    });
  });

  test.describe('When an address the save manager does not serve is requested', () => {
    test('should say it was not found and lead back home', async ({page}) => {
      // Arrange
      await page.goto('/no-such-page');
      await expect(page.getByTestId('not-found-title')).toHaveText('Not Found');

      // Act
      await page.getByTestId('back-home-link').click();

      // Assert
      await expect(page.getByTestId('display-area')).toBeVisible();
    });
  });
});
