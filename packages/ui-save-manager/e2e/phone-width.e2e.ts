import {type Page} from '@playwright/test';
import {measureTheHorizontalScrollOfThePage} from './helpers/measureTheHorizontalScrollOfThePage';
import {reachWithTheTabKey} from './helpers/reachWithTheTabKey';
import {triggerSaveFileMerge} from './helpers/triggerSaveFileMerge';
import {expect, test} from './scenarioTest';
import {locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const otherPlayerSaveFixturePath = locateTheFixture('other-player_valid.json');
const energyConsumptionSaveFixturePath = locateTheFixture('energy-consumption_valid.json');

const noHorizontalScroll = 0;

const wholeScreen = {x: 0, y: 0, width: 360, height: 800};

async function displayThePowerAs(page: Page, formLabel: string): Promise<void> {
  await page.getByTestId('power-display-form').selectOption({label: formLabel});
}

async function openThePageOfThePhoneMenu(page: Page, pageName: string): Promise<void> {
  await page.getByTestId('menu-button').click();
  await openThePageOfTheMenu(page, pageName);
}

async function openThePlayersPageOfThePhoneMenu(page: Page): Promise<void> {
  await page.getByTestId('menu-button').click();
  await page.getByTestId('more-players').click();
}

async function bringToTheBottomOfTheScreen(page: Page, testId: string): Promise<void> {
  await page.getByTestId(testId).evaluate((element) => element.scrollIntoView({block: 'end'}));
}

async function findTheTestIdShownAt(page: Page, point: {x: number; y: number}): Promise<string | null | undefined> {
  return page.evaluate(({x, y}) => document.elementFromPoint(x, y)?.closest('[data-testid]')?.getAttribute('data-testid'), point);
}

test.use({viewport: {width: 360, height: 800}});

test.describe('Save manager at phone width', () => {
  test.describe('When the home page is opened on a screen 360 pixels wide', () => {
    test('should fit the screen without a horizontal scroll', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('home-page')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When the Load save page is opened on a screen 360 pixels wide', () => {
    test('should fit the screen without a horizontal scroll', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page.getByTestId('save-file')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When two saves are merged on a screen 360 pixels wide', () => {
    test('should fit the merge form and the merged save to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await page.goto('/merge');

      // Act
      await triggerSaveFileMerge(page, baselineSaveFixturePath, otherPlayerSaveFixturePath);

      // Assert
      await expect(page.getByTestId('merged-save-download')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When a save is visualized on a screen 360 pixels wide', () => {
    test('should fit the menu and the Overview page with its planet cards to the screen without a horizontal scroll', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-planet-0-details')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });

    test('should show the save identity and a Menu button in place of the pages of the menu', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('menu-button')).toBeVisible();
      await expect(page.getByTestId('menu-button')).toHaveText('Menu');
      await expect(page.getByTestId('save-identity')).toBeVisible();
      await expect(page.getByTestId('overview-page-link')).toBeHidden();
    });
  });

  test.describe('When the Menu button is pressed on a screen 360 pixels wide', () => {
    test('should open the pages of the menu over the whole screen', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('menu-button').click();

      // Assert
      await expect(page.getByTestId('overview-page-link')).toBeVisible();
      expect(await page.getByTestId('menu-dialog').boundingBox()).toEqual(wholeScreen);
    });
  });

  test.describe('When a page of the open menu is chosen on a screen 360 pixels wide', () => {
    test('should close the menu and open that page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('menu-button').click();

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-title')).toBeVisible();
      await expect(page.getByTestId('overview-page-link')).toBeHidden();
    });
  });

  test.describe('When the Close button of the open menu is pressed on a screen 360 pixels wide', () => {
    test('should close the menu, the save identity still shown', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('menu-button').click();

      // Act
      await page.getByTestId('menu-close').click();

      // Assert
      await expect(page.getByTestId('overview-page-link')).toBeHidden();
      await expect(page.getByTestId('save-identity')).toBeVisible();
    });
  });

  test.describe('When the Details button of a planet card holds the keyboard focus on a screen 360 pixels wide', () => {
    test('should show its tooltip above the Details button of the next planet card', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await reachWithTheTabKey(page, page.getByTestId('overview-planet-0-details'));

      // Act
      await bringToTheBottomOfTheScreen(page, 'overview-planet-1-details');

      // Assert
      const tooltipBox = (await page.getByTestId('overview-planet-0-details-description').boundingBox())!;
      const nextDetailsBox = (await page.getByTestId('overview-planet-1-details').boundingBox())!;
      const pointOverBoth = {x: nextDetailsBox.x + nextDetailsBox.width / 2, y: Math.max(tooltipBox.y, nextDetailsBox.y) + 1};
      expect(await findTheTestIdShownAt(page, pointOverBoth)).toBe('overview-planet-0-details-description');
    });
  });

  test.describe('When the Configuration page is opened on a screen 360 pixels wide', () => {
    test('should fit its cards to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfThePhoneMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId('modifiers-title')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When the Power page is opened on a screen 360 pixels wide', () => {
    test('should fit its figures and its bars by machine to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfThePhoneMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-chart-production-bar-0')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When Share of each machine type is chosen on the Power page on a screen 360 pixels wide', () => {
    test('should fit its stacked bars to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfThePhoneMenu(page, 'Power');

      // Act
      await displayThePowerAs(page, 'Share of each machine type');

      // Assert
      await expect(page.getByTestId('power-share-production-segment-0')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When Table is chosen on the Power page on a screen 360 pixels wide', () => {
    test('should show each row of its tables as a card inside the screen, its figures one under the other', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfThePhoneMenu(page, 'Power');

      // Act
      await displayThePowerAs(page, 'Table');

      // Assert
      await expect(page.getByTestId('power-producers-column-names')).toBeHidden();
      const machineBox = (await page.getByTestId('power-producers-row-0-machine').boundingBox())!;
      const quantityBox = (await page.getByTestId('power-producers-row-0-quantity').boundingBox())!;
      expect(quantityBox.y).toBeGreaterThanOrEqual(machineBox.y + machineBox.height);
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });

    test('should name each figure of a row by its column', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfThePhoneMenu(page, 'Power');

      // Act
      await displayThePowerAs(page, 'Table');

      // Assert
      await expect(page.getByTestId('power-producers-row-0-quantity-column')).toBeVisible();
      await expect(page.getByTestId('power-producers-row-0-quantity-column')).toHaveText('Quantity');
    });
  });

  test.describe('When the Terraformation page is opened on a screen 360 pixels wide', () => {
    test('should fit its figures and its tables to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfThePhoneMenu(page, 'Terraformation');

      // Assert
      await expect(page.getByTestId('terraformation-planet-title')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When the Players page is opened on a screen 360 pixels wide', () => {
    test('should fit its player cards to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePlayersPageOfThePhoneMenu(page);

      // Assert
      await expect(page.getByTestId('players-count')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });

    test('should show the inventory of each player first, the equipment folded', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePlayersPageOfThePhoneMenu(page);

      // Assert
      await expect(page.getByTestId('player-0-show-equipment')).toBeVisible();
      await expect(page.getByTestId('player-0-equipment-slots')).toBeHidden();
      await expect(page.getByTestId('player-0-inventory-caption')).toBeVisible();
    });
  });

  test.describe('When the equipment of a player is unfolded on a screen 360 pixels wide', () => {
    test('should show the equipment slots of that player', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePlayersPageOfThePhoneMenu(page);

      // Act
      await page.getByTestId('player-0-show-equipment').click();

      // Assert
      await expect(page.getByTestId('player-0-equipment-slots')).toBeVisible();
    });
  });
});
