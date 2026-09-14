import {readFile} from 'node:fs/promises';
import {expect, test, type Download, type Page} from '@playwright/test';

const saveAFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const saveBFixturePath = new URL('./fixtures/other-player_valid.json', import.meta.url).pathname;

/** The name the merge gives its output, built from the two source file names. */
const mergedFileName = 'baseline_valid-other-player_valid-merged.json';

/**
 * The save display name the merge writes into the produced file. Neither source carries it, so it
 * tells the merged save apart from the two files that were fed to the merge.
 */
const mergedSaveDisplayName = '"saveDisplayName":"baseline_valid-other-player_valid-merged"';

async function mergeTheTwoFixtures(page: Page): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);
  await page.getByLabel('Save B:').setInputFiles(saveBFixturePath);
  await page.getByRole('button', {name: 'Merge'}).click();
  await expect(page.getByText('Merge successful!')).toBeVisible();
}

async function readDownloadedFile(download: Download): Promise<string> {
  const downloadedFilePath = await download.path();

  return readFile(downloadedFilePath, 'utf8');
}

test.describe('Save merge', () => {
  test.describe('When two valid save files are merged', () => {
    test('should offer the produced file for download under the announced name', async ({page}) => {
      // Arrange
      await mergeTheTwoFixtures(page);
      await expect(page.getByText(`Created file: ${mergedFileName}`)).toBeVisible();

      // Act
      const downloadStarted = page.waitForEvent('download');
      await page.getByRole('link', {name: 'Download'}).click();
      const download = await downloadStarted;

      // Assert
      expect(download.suggestedFilename()).toBe(mergedFileName);
    });

    test('should hand over the merged save and not one of the two source files', async ({page}) => {
      // Arrange
      const saveAContent = await readFile(saveAFixturePath, 'utf8');
      const saveBContent = await readFile(saveBFixturePath, 'utf8');
      await mergeTheTwoFixtures(page);

      // Act
      const downloadStarted = page.waitForEvent('download');
      await page.getByRole('link', {name: 'Download'}).click();
      const downloadedContent = await readDownloadedFile(await downloadStarted);

      // Assert
      expect(downloadedContent).toContain(mergedSaveDisplayName);
      expect(downloadedContent).not.toBe(saveAContent);
      expect(downloadedContent).not.toBe(saveBContent);
    });
  });
});
