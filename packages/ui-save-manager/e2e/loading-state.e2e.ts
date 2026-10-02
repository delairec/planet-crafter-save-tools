import {type Page} from '@playwright/test';
import {holdEveryFileRead, releaseTheHeldFileReads} from './helpers/holdEveryFileRead';
import {expect, test} from './scenarioTest';
import {chooseTheSaveToVisualize, chooseTheTwoSavesToMerge, locateTheFixture} from './scenarioSteps';

const saveAFixturePath = locateTheFixture('baseline_valid.json');
const saveBFixturePath = locateTheFixture('other-player_valid.json');

async function chooseTheSaveToVisualizeWithTheReadsHeld(page: Page): Promise<void> {
  await holdEveryFileRead(page);
  await chooseTheSaveToVisualize(page, saveAFixturePath);
}

async function chooseTheTwoSavesToMergeWithTheReadsHeld(page: Page): Promise<void> {
  await holdEveryFileRead(page);
  await page.goto('/merge');
  await chooseTheTwoSavesToMerge(page, saveAFixturePath, saveBFixturePath);
}

async function startVisualizingWithTheReadsHeld(page: Page): Promise<void> {
  await chooseTheSaveToVisualizeWithTheReadsHeld(page);
  await page.getByTestId('visualize').click();
  await expect(page.getByTestId('display-busy-indicator')).toBeVisible();
}

async function startMergingWithTheReadsHeld(page: Page): Promise<void> {
  await chooseTheTwoSavesToMergeWithTheReadsHeld(page);
  await page.getByTestId('merge').click();
  await expect(page.getByTestId('merge-busy-indicator')).toBeVisible();
}

test.describe('Loading states', () => {
  test.describe('When a save file is being read for display', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await chooseTheSaveToVisualizeWithTheReadsHeld(page);

      // Act
      await page.getByTestId('visualize').click();

      // Assert
      await expect(page.getByTestId('display-busy-indicator')).toBeVisible();
      await expect(page.getByTestId('visualize')).toBeDisabled();
    });
  });

  test.describe('When the display of a save file completes', () => {
    test('should end the busy state and open the Overview page on the save', async ({page}) => {
      // Arrange
      await startVisualizingWithTheReadsHeld(page);

      // Act
      await releaseTheHeldFileReads(page);

      // Assert
      await expect(page.getByTestId('overview-identity-title')).toHaveText('Merged Save');
      await expect(page).toHaveURL(/\/overview$/);
    });
  });

  test.describe('When two save files are being read for a merge', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await chooseTheTwoSavesToMergeWithTheReadsHeld(page);

      // Act
      await page.getByTestId('merge').click();

      // Assert
      await expect(page.getByTestId('merge-busy-indicator')).toBeVisible();
      await expect(page.getByTestId('merge')).toBeDisabled();
    });
  });

  test.describe('When a merge completes', () => {
    test('should withdraw the busy indicator and hand the button back', async ({page}) => {
      // Arrange
      await startMergingWithTheReadsHeld(page);

      // Act
      await releaseTheHeldFileReads(page);

      // Assert
      await expect(page.getByTestId('merge-success-message')).toBeVisible();
      await expect(page.getByTestId('merge-busy-indicator')).toBeHidden();
      await expect(page.getByTestId('merge')).toBeEnabled();
    });
  });
});
