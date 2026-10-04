import {type Page} from '@playwright/test';
import {measureTheHorizontalScrollOfThePage} from './helpers/measureTheHorizontalScrollOfThePage';
import {triggerSaveFileMerge} from './helpers/triggerSaveFileMerge';
import {expect, test} from './scenarioTest';
import {locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const otherPlayerSaveFixturePath = locateTheFixture('other-player_valid.json');
const energyConsumptionSaveFixturePath = locateTheFixture('energy-consumption_valid.json');

const noHorizontalScroll = 0;

async function displayThePowerAs(page: Page, formLabel: string): Promise<void> {
  await page.getByTestId('power-display-form').selectOption({label: formLabel});
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
  });

  test.describe('When the Configuration page is opened on a screen 360 pixels wide', () => {
    test('should fit its cards to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

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
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      await expect(page.getByTestId('power-chart-production-bar-0')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When Share of each machine type is chosen on the Power page on a screen 360 pixels wide', () => {
    test('should fit its stacked bars to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Power');

      // Act
      await displayThePowerAs(page, 'Share of each machine type');

      // Assert
      await expect(page.getByTestId('power-share-production-segment-0')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When Table is chosen on the Power page on a screen 360 pixels wide', () => {
    test('should keep its tables inside the screen, each scrolling in its own card', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Power');

      // Act
      await displayThePowerAs(page, 'Table');

      // Assert
      await expect(page.getByTestId('power-producers-body')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });

  test.describe('When the Terraformation page is opened on a screen 360 pixels wide', () => {
    test('should fit its figures and its tables to the screen without a horizontal scroll', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

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
      await page.getByTestId('more-players').click();

      // Assert
      await expect(page.getByTestId('players-count')).toBeVisible();
      expect(await measureTheHorizontalScrollOfThePage(page)).toBe(noHorizontalScroll);
    });
  });
});
