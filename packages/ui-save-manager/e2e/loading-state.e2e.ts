import {expect, test, type Page} from '@playwright/test';

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
  await page.getByLabel('Save file:').setInputFiles(saveAFixturePath);
  await page.getByRole('button', {name: 'Visualize'}).click();
  await expect(page.getByRole('status')).toBeVisible();
}

async function startMergingWithTheReadsHeld(page: Page): Promise<void> {
  await holdEveryFileRead(page);
  await page.goto('/');
  await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);
  await page.getByLabel('Save B:').setInputFiles(saveBFixturePath);
  await page.getByRole('button', {name: 'Merge'}).click();
  await expect(page.getByRole('status')).toBeVisible();
}

test.describe('Loading states', () => {
  test.describe('When a save file is being read for display', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await page.goto('/');
      await page.getByLabel('Save file:').setInputFiles(saveAFixturePath);

      // Act
      await page.getByRole('button', {name: 'Visualize'}).click();

      // Assert
      await expect(page.getByRole('status')).toBeVisible();
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
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
      await expect(page.getByRole('button', {name: 'Visualize'})).toBeEnabled();
    });
  });

  test.describe('When two save files are being read for a merge', () => {
    test('should show a busy indicator and keep the button out of reach', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await page.goto('/');
      await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);
      await page.getByLabel('Save B:').setInputFiles(saveBFixturePath);

      // Act
      await page.getByRole('button', {name: 'Merge'}).click();

      // Assert
      await expect(page.getByRole('status')).toBeVisible();
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
      await expect(page.getByRole('status')).toBeHidden();
      await expect(page.getByRole('button', {name: 'Merge'})).toBeEnabled();
    });
  });
});
