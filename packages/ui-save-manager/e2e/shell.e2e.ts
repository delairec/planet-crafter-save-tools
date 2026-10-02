import {type Locator, type Page} from '@playwright/test';
import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, findTheMenu, findTheMenuGroupTitles, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');

type ShellPart = 'title' | 'disclaimers' | 'page' | 'footer';

async function orderTheShellPartsFromTopToBottom(partLocators: [ShellPart, Locator][]): Promise<ShellPart[]> {
  const partTops = await Promise.all(partLocators.map(async ([part, locator]) => ({part, top: (await locator.boundingBox())!.y})));

  return partTops.sort((first, second) => first.top - second.top).map(({part}) => part);
}

async function readTheShellPartsFromTopToBottom(page: Page, pageContentTestId: string): Promise<ShellPart[]> {
  return orderTheShellPartsFromTopToBottom([
    ['title', page.getByTestId('application-title')],
    ['disclaimers', page.getByTestId('disclaimers')],
    ['page', page.getByTestId(pageContentTestId)],
    ['footer', page.getByTestId('application-version')]
  ]);
}

async function readThePageColumnFromTopToBottom(page: Page, pageContentTestId: string): Promise<ShellPart[]> {
  return orderTheShellPartsFromTopToBottom([
    ['disclaimers', page.getByTestId('disclaimers')],
    ['page', page.getByTestId(pageContentTestId)],
    ['footer', page.getByTestId('application-version')]
  ]);
}

type TitlePlacement = {aboveTheMenuGroups: boolean; besideThePage: boolean};

async function readThePlacementOfTheTitle(page: Page, pageContentTestId: string): Promise<TitlePlacement> {
  const titleBox = (await page.getByTestId('application-title').boundingBox())!;
  const firstMenuGroupBox = (await page.getByTestId('tools-pages').boundingBox())!;
  const pageBox = (await page.getByTestId(pageContentTestId).boundingBox())!;

  return {
    aboveTheMenuGroups: titleBox.y + titleBox.height <= firstMenuGroupBox.y,
    besideThePage: titleBox.x + titleBox.width <= pageBox.x
  };
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
  test.describe('When the home page is opened', () => {
    test('should show the disclaimers under the title, above the page and above the version footer', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      const shellParts = await readTheShellPartsFromTopToBottom(page, 'home-page');

      // Assert
      expect(shellParts).toEqual(['title', 'disclaimers', 'page', 'footer']);
    });
  });

  test.describe('When the Load save page is opened', () => {
    test('should show the title at the top of the menu, beside the page rather than above it', async ({page}) => {
      // Arrange
      await page.goto('/load-save');

      // Act
      const titlePlacement = await readThePlacementOfTheTitle(page, 'display-area');

      // Assert
      expect(titlePlacement).toEqual({aboveTheMenuGroups: true, besideThePage: true});
    });

    test('should show the disclaimers above the page and above the version footer', async ({page}) => {
      // Arrange
      await page.goto('/load-save');

      // Act
      const pageColumnParts = await readThePageColumnFromTopToBottom(page, 'display-area');

      // Assert
      expect(pageColumnParts).toEqual(['disclaimers', 'page', 'footer']);
    });

    test('should offer the Tools group alone, holding Merge two saves and Load save', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(findTheMenuGroupTitles(page)).toHaveText(['Tools']);
      await expect(findTheMenu(page).getByTestId(/-page-link$/)).toHaveText(['Merge two saves', 'Load save']);
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
      await expect(page.getByTestId('save-pages').getByTestId(/-page-link$/))
        .toHaveText(['Overview', 'Configuration', 'Power', 'Terraformation']);
    });

    test('should end the Players group on a See more button', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      const playersGroup = page.getByTestId('players-pages');
      const seeMoreButton = playersGroup.getByTestId('more-players');
      await expect(seeMoreButton).toHaveText('See more');
      expect((await seeMoreButton.boundingBox())!.y)
        .toBeGreaterThan((await playersGroup.getByTestId(/^player-summary-\d+$/).last().boundingBox())!.y);
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
        .toBeLessThan((await page.getByTestId('save-pages').boundingBox())!.y);
    });

    test('should list the players in the Players group', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('players-pages').getByTestId(/^player-summary-\d+$/))
        .toHaveText(['NikowaHostToxicity']);
    });
  });

  test.describe('When a legacy save is loaded', () => {
    test('should list its players with the planet they stand on', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('players-pages').getByTestId(/^player-summary-\d+$/))
        .toHaveText(['NikowaHostToxicity']);
    });
  });

  test.describe('When a page of the save is opened', () => {
    test('should show the title at the top of the menu, beside the page rather than above it', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Configuration');

      // Act
      const titlePlacement = await readThePlacementOfTheTitle(page, 'global-progression-title');

      // Assert
      expect(titlePlacement).toEqual({aboveTheMenuGroups: true, besideThePage: true});
    });

    test('should show the disclaimers above the page and above the version footer', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Configuration');

      // Act
      const pageColumnParts = await readThePageColumnFromTopToBottom(page, 'global-progression-title');

      // Assert
      expect(pageColumnParts).toEqual(['disclaimers', 'page', 'footer']);
    });
  });

  test.describe('When the title is chosen at the top of the menu', () => {
    test('should lead to the home page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(page.getByTestId('home-page')).toBeVisible();
    });
  });

  test.describe('When the reader switches from page to page', () => {
    test('should keep the loaded save without reading its file again nor reloading the page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await expect(page.getByTestId('overview-identity-title')).toHaveText('Merged Save');
      await holdEveryFurtherFileRead(page);
      const loadedDocumentUrls = recordTheDocumentLoads(page);
      await openThePageOfTheMenu(page, 'Power');

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId('modifiers-title')).toHaveText('Modifiers');
      expect(loadedDocumentUrls).toEqual([]);
    });
  });

  test.describe('When a page of the save is requested with no save loaded', () => {
    test('should open the Load save page', async ({page}) => {
      // Act
      await page.goto('/configuration');

      // Assert
      await expect(page).toHaveURL(/\/load-save$/);
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Tools', 'Load save']);
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
      await expect(page.getByTestId('save-a')).toBeVisible();
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
      await expect(page.getByTestId('save-file')).toBeVisible();
    });
  });

  test.describe('When an address the save manager does not serve is requested', () => {
    test('should say it was not found and lead back home', async ({page}) => {
      // Arrange
      await page.goto('/no-such-page');
      await expect(page.getByTestId('not-found-title')).toHaveText('Not Found');

      // Act
      await page.getByTestId('home-page-link').click();

      // Assert
      await expect(page.getByTestId('home-page')).toBeVisible();
    });
  });
});
