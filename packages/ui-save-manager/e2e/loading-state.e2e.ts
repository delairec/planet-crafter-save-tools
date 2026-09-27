import {expect, test, type Page} from '@playwright/test';
import {holdEveryFileRead, releaseTheHeldFileReads} from './helpers/holdEveryFileRead';
import {chooseTheSaveToVisualize, chooseTheTwoSavesToMerge, locateTheFixture} from './scenarioSteps';

const saveAFixturePath = locateTheFixture('baseline_valid.json');
const saveBFixturePath = locateTheFixture('other-player_valid.json');

async function chooseTheSaveToVisualizeWithTheReadsHeld(page: Page): Promise<void> {
  await holdEveryFileRead(page);
  await chooseTheSaveToVisualize(page, saveAFixturePath);
}

async function chooseTheTwoSavesToMergeWithTheReadsHeld(page: Page): Promise<void> {
  await holdEveryFileRead(page);
  await page.goto('/');
  await chooseTheTwoSavesToMerge(page, saveAFixturePath, saveBFixturePath);
}

async function startVisualizingWithTheReadsHeld(page: Page): Promise<void> {
  await chooseTheSaveToVisualizeWithTheReadsHeld(page);
  await page.getByRole('button', {name: 'Visualize'}).click();
  await expect(page.getByTestId('display-busy-indicator')).toBeVisible();
}

async function startMergingWithTheReadsHeld(page: Page): Promise<void> {
  await chooseTheTwoSavesToMergeWithTheReadsHeld(page);
  await page.getByRole('button', {name: 'Merge'}).click();
  await expect(page.getByTestId('merge-busy-indicator')).toBeVisible();
}

test.describe('Loading states', () => {
  test.describe('When a save file is being read for display', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await chooseTheSaveToVisualizeWithTheReadsHeld(page);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByTestId('display-busy-indicator')).toBeVisible();
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeDisabled();
    });
  });

  test.describe('When the display of a save file completes', () => {
    test('should end the busy state and hand the button back', async ({page}) => {
      // Arrange
      await startVisualizingWithTheReadsHeld(page);

      // Act
      await releaseTheHeldFileReads(page);

      // Assert
      await expect(page.getByRole('heading', {name: 'Loaded save: baseline_valid.json'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeEnabled();
    });
  });

  test.describe('When two save files are being read for a merge', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await chooseTheTwoSavesToMergeWithTheReadsHeld(page);

      // Act
      await page.getByRole('button', {name: 'Merge'}).click();

      // Assert
      await expect(page.getByTestId('merge-busy-indicator')).toBeVisible();
      await expect(page.getByRole('button', {name: 'Merge'})).toBeDisabled();
    });
  });

  test.describe('When a merge completes', () => {
    test('should withdraw the busy indicator and hand the button back', async ({page}) => {
      // Arrange
      await startMergingWithTheReadsHeld(page);

      // Act
      await releaseTheHeldFileReads(page);

      // Assert
      await expect(page.getByText('Merge successful!')).toBeVisible();
      await expect(page.getByTestId('merge-busy-indicator')).toBeHidden();
      await expect(page.getByRole('button', {name: 'Merge'})).toBeEnabled();
    });
  });
});
