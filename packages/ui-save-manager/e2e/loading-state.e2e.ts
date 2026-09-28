import {type Page} from '@playwright/test';
import {expect, test} from './scenarioTest';
import {chooseTheSaveToVisualize, chooseTheTwoSavesToMerge, locateTheFixture} from './scenarioSteps';

const saveAFixturePath = locateTheFixture('baseline_valid.json');
const saveBFixturePath = locateTheFixture('other-player_valid.json');

declare global {
  interface Window {
    releaseTheHeldFileReads(): void;
  }
}

async function holdEveryFileRead(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const readTextOfBlob = Blob.prototype.text;
    const readArrayBufferOfBlob = Blob.prototype.arrayBuffer;
    let letTheReadsThrough = () => {};
    const readsReleased = new Promise<void>((resolve) => {
      letTheReadsThrough = resolve;
    });

    window.releaseTheHeldFileReads = () => letTheReadsThrough();

    Blob.prototype.text = function (this: Blob) {
      return readsReleased.then(() => readTextOfBlob.call(this));
    };
    Blob.prototype.arrayBuffer = function (this: Blob) {
      return readsReleased.then(() => readArrayBufferOfBlob.call(this));
    };
    Blob.prototype.stream = function (this: Blob) {
      const bytesRead = readsReleased.then(() => readArrayBufferOfBlob.call(this));

      return new ReadableStream({
        async start(controller) {
          controller.enqueue(new Uint8Array(await bytesRead));
          controller.close();
        }
      });
    };
  });
}

async function releaseTheHeldFileReads(page: Page): Promise<void> {
  await page.evaluate(() => window.releaseTheHeldFileReads());
}

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
  await page.getByTestId('visualize-button').click();
  await expect(page.getByTestId('display-busy-indicator')).toBeVisible();
}

async function startMergingWithTheReadsHeld(page: Page): Promise<void> {
  await chooseTheTwoSavesToMergeWithTheReadsHeld(page);
  await page.getByTestId('merge-button').click();
  await expect(page.getByTestId('merge-busy-indicator')).toBeVisible();
}

test.describe('Loading states', () => {
  test.describe('When a save file is being read for display', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await chooseTheSaveToVisualizeWithTheReadsHeld(page);

      // Act
      await page.getByTestId('visualize-button').click();

      // Assert
      await expect(page.getByTestId('display-busy-indicator')).toBeVisible();
      await expect(page.getByTestId('visualize-button')).toBeDisabled();
    });
  });

  test.describe('When the display of a save file completes', () => {
    test('should end the busy state and hand the button back', async ({page}) => {
      // Arrange
      await startVisualizingWithTheReadsHeld(page);

      // Act
      await releaseTheHeldFileReads(page);

      // Assert
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
      await expect(page.getByTestId('visualize-button')).toBeEnabled();
    });
  });

  test.describe('When two save files are being read for a merge', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await chooseTheTwoSavesToMergeWithTheReadsHeld(page);

      // Act
      await page.getByTestId('merge-button').click();

      // Assert
      await expect(page.getByTestId('merge-busy-indicator')).toBeVisible();
      await expect(page.getByTestId('merge-button')).toBeDisabled();
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
      await expect(page.getByTestId('merge-button')).toBeEnabled();
    });
  });
});
