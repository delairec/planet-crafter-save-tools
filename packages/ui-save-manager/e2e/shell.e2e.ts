import {expect, test, type Locator, type Page} from '@playwright/test';
import {findTheBreadcrumbSteps, findTheMenu, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

const disclaimersSummary = 'Click here to show privacy, security and file safety disclaimers';

type ShellPart = 'title' | 'disclaimers' | 'page' | 'footer';

async function readTheShellPartsFromTopToBottom(page: Page, pageContentHeading: string): Promise<ShellPart[]> {
  const partLocators: [ShellPart, Locator][] = [
    ['title', page.getByRole('heading', {name: 'Planet Crafter Save Manager', level: 1})],
    ['disclaimers', page.getByText(disclaimersSummary)],
    ['page', page.getByRole('heading', {name: pageContentHeading})],
    ['footer', page.getByRole('contentinfo')]
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
      const shellParts = await readTheShellPartsFromTopToBottom(page, 'Display a save\'s data');

      // Assert
      expect(shellParts).toEqual(['title', 'disclaimers', 'page', 'footer']);
    });

    test('should offer the Tools group alone, holding Merge two saves and Load another save', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(findTheMenu(page).getByRole('group')).toHaveAccessibleName('Tools');
      await expect(findTheMenu(page).getByRole('link')).toHaveText(['Merge two saves', 'Load another save']);
    });
  });

  test.describe('When a save is loaded', () => {
    test('should show the Tools, Save and Players groups of the menu in that order', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(findTheMenu(page).getByRole('group').nth(2)).toHaveAccessibleName('Players');
      await expect(findTheMenu(page).getByRole('group').nth(1)).toHaveAccessibleName('Save');
      await expect(findTheMenu(page).getByRole('group').nth(0)).toHaveAccessibleName('Tools');
    });

    test('should offer the Overview, Configuration, Power and Terraformation pages in the Save group', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(findTheMenu(page).getByRole('group', {name: 'Save', exact: true}).getByRole('link'))
        .toHaveText(['Overview', 'Configuration', 'Power', 'Terraformation']);
    });

    test('should end the Players group on a See more button', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(findTheMenu(page).getByRole('group', {name: 'Players'}).getByRole('button').last()).toHaveText('See more');
    });
  });

  test.describe('When a page of the save is opened', () => {
    test('should show the disclaimers under the title, above the page and above the version footer', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Configuration');

      // Act
      const shellParts = await readTheShellPartsFromTopToBottom(page, 'Global progression');

      // Assert
      expect(shellParts).toEqual(['title', 'disclaimers', 'page', 'footer']);
    });
  });

  test.describe('When the reader switches from page to page', () => {
    test('should keep the loaded save without reading its file again nor reloading the page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await expect(page.getByRole('heading', {name: 'Loaded save: baseline_valid.json'})).toBeVisible();
      await holdEveryFurtherFileRead(page);
      const loadedDocumentUrls = recordTheDocumentLoads(page);
      await openThePageOfTheMenu(page, 'Power');

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
      expect(loadedDocumentUrls).toEqual([]);
    });
  });

  test.describe('When a page of the save is requested with no save loaded', () => {
    test('should open the Overview page', async ({page}) => {
      // Act
      await page.goto('/configuration');

      // Assert
      await expect(page.getByRole('group', {name: 'Display a save\'s data'})).toBeVisible();
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
      await expect(page.getByLabel('Save A:')).toBeVisible();
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
      await expect(page.getByLabel('Save file:')).toBeVisible();
    });
  });

  test.describe('When an address the save manager does not serve is requested', () => {
    test('should say it was not found and lead back home', async ({page}) => {
      // Arrange
      await page.goto('/no-such-page');
      await expect(page.getByText('Not Found')).toBeVisible();

      // Act
      await page.getByRole('link', {name: 'Back home'}).click();

      // Assert
      await expect(page.getByRole('group', {name: 'Display a save\'s data'})).toBeVisible();
    });
  });
});
