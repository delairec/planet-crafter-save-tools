import {expect, test, type Page} from '@playwright/test';
import {visualizeSave} from "./helpers/visualizeSave";
import {triggerSaveFileMerge} from "./helpers/triggerSaveFileMerge";

const saveAFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const saveBFixturePath = new URL('./fixtures/other-player_valid.json', import.meta.url).pathname;

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

async function startVisualizingWithTheReadsHeld(page: Page): Promise<void> {
  await holdEveryFileRead(page);
  await page.goto('/');
  await visualizeSave(page, saveAFixturePath);
  await expect(page.getByTestId('display-busy-indicator')).toBeVisible();
}

async function startMergingWithTheReadsHeld(page: Page): Promise<void> {
  await holdEveryFileRead(page);
  await page.goto('/');
  await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);
  await expect(page.getByTestId('merge-busy-indicator')).toBeVisible();
}

test.describe('Loading states', () => {
  test.describe('When a save file is being read for display', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await page.goto('/');

      // Act
      await visualizeSave(page, saveAFixturePath);

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
      await expect(page.getByTestId('save-configuration-title')).toHaveText('Save Configuration: Merged Save (Standard)');
      await expect(page.getByTestId('visualize-button')).toBeEnabled();
    });
  });

  test.describe('When two save files are being read for a merge', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await page.goto('/');

      // Act
      await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);

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
