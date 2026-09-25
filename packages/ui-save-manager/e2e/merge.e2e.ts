import {readFile} from 'node:fs/promises';
import {expect, test, type Download, type Page} from '@playwright/test';

const saveAFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const saveBFixturePath = new URL('./fixtures/other-player_valid.json', import.meta.url).pathname;
const legacySaveFixturePath = new URL('./fixtures/legacy-format_valid.json', import.meta.url).pathname;

/** The name the merge gives its output, built from the two source file names. */
const mergedFileName = 'baseline_valid-other-player_valid-merged.json';

/**
 * The save display name the merge writes into the produced file. Neither source carries it, so it
 * tells the merged save apart from the two files that were fed to the merge.
 */
const mergedSaveDisplayName = '"saveDisplayName":"baseline_valid-other-player_valid-merged"';

/**
 * The Terrain Layers entry of the legacy fixture. Only the legacy format carries that section, so its presence in
 * the merged save tells the format written.
 */
const legacyTerrainLayerEntry = '"layerId":"PC-Toxicity-Layer2"';

const preferLegacyFormatLabel = 'Prefer legacy format';

const preferLegacyFormatDescription =
  'Tick this checkbox if you want to align the save format on the older version instead of the newer.';

const keepLegacyFormatReminder = 'To write the legacy format instead, tick "Prefer legacy format" and merge again.';

async function chooseTheTwoSaves(page: Page, chosenSaveAPath: string, chosenSaveBPath: string): Promise<void> {
  await page.goto('/');
  await page.getByLabel('Save A:').setInputFiles(chosenSaveAPath);
  await page.getByLabel('Save B:').setInputFiles(chosenSaveBPath);
}

async function mergeTheChosenSaves(page: Page): Promise<void> {
  await page.getByRole('button', {name: 'Merge'}).click();
  await expect(page.getByText('Merge successful!')).toBeVisible();
}

/** The merge report is the last message list of the result: the warnings of each input come before it. */
async function mergeAndRevealTheMergeReport(page: Page): Promise<void> {
  await mergeTheChosenSaves(page);
  await page.getByText('Show details').last().click();
}

async function mergeTheTwoFixtures(page: Page): Promise<void> {
  await chooseTheTwoSaves(page, saveAFixturePath, saveBFixturePath);
  await mergeTheChosenSaves(page);
}

async function downloadTheProducedFile(page: Page): Promise<Download> {
  const downloadStarted = page.waitForEvent('download');
  await page.getByRole('link', {name: 'Download'}).click();

  return downloadStarted;
}

async function readTheDownloadedFile(page: Page): Promise<string> {
  const download = await downloadTheProducedFile(page);
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
      const download = await downloadTheProducedFile(page);

      // Assert
      expect(download.suggestedFilename()).toBe(mergedFileName);
    });

    test('should hand over the merged save and not one of the two source files', async ({page}) => {
      // Arrange
      const saveAContent = await readFile(saveAFixturePath, 'utf8');
      const saveBContent = await readFile(saveBFixturePath, 'utf8');
      await mergeTheTwoFixtures(page);

      // Act
      const downloadedContent = await readTheDownloadedFile(page);

      // Assert
      expect(downloadedContent).toContain(mergedSaveDisplayName);
      expect(downloadedContent).not.toBe(saveAContent);
      expect(downloadedContent).not.toBe(saveBContent);
    });
  });

  test.describe('When a legacy save is merged with a current one', () => {
    test('should hand over a merged save written in the current format', async ({page}) => {
      // Arrange
      await chooseTheTwoSaves(page, legacySaveFixturePath, saveAFixturePath);
      await mergeTheChosenSaves(page);

      // Act
      const downloadedContent = await readTheDownloadedFile(page);

      // Assert
      expect(downloadedContent).not.toContain(legacyTerrainLayerEntry);
    });

    test('should report the format written and tell how to keep the legacy one, never showing a warning code', async ({page}) => {
      // Arrange
      await chooseTheTwoSaves(page, legacySaveFixturePath, saveAFixturePath);

      // Act
      await mergeAndRevealTheMergeReport(page);

      // Assert
      await expect(page.getByText('Merge warnings')).toBeVisible();
      await expect(page.getByText('The two saves carry different formats; the merged save is written in the format of release 2.004.')).toBeVisible();
      await expect(page.getByText(keepLegacyFormatReminder)).toBeVisible();
      await expect(page.getByRole('list').last()).not.toContainText('merged-save-format');
    });

    test('should show the merge report and the way to keep the legacy format above the success message', async ({page}) => {
      // Arrange
      await chooseTheTwoSaves(page, legacySaveFixturePath, saveAFixturePath);

      // Act
      await mergeAndRevealTheMergeReport(page);

      // Assert
      const successMessageTop = (await page.getByText('Merge successful!').boundingBox())!.y;
      const mergeWarningsTitleTop = (await page.getByText('Merge warnings').boundingBox())!.y;
      const keepLegacyFormatReminderTop = (await page.getByText(keepLegacyFormatReminder).boundingBox())!.y;
      expect(mergeWarningsTitleTop).toBeLessThan(successMessageTop);
      expect(keepLegacyFormatReminderTop).toBeLessThan(successMessageTop);
    });
  });

  test.describe('When a legacy save is merged with a current one, the legacy format being asked for', () => {
    test('should hand over a merged save written in the legacy format', async ({page}) => {
      // Arrange
      await chooseTheTwoSaves(page, legacySaveFixturePath, saveAFixturePath);
      await page.getByLabel(preferLegacyFormatLabel).check();
      await mergeTheChosenSaves(page);

      // Act
      const downloadedContent = await readTheDownloadedFile(page);

      // Assert
      expect(downloadedContent).toContain(legacyTerrainLayerEntry);
    });
  });

  test.describe('When the legacy format checkbox takes the keyboard focus', () => {
    test('should show the tooltip that describes it, read by a screen reader as its description', async ({page}) => {
      // Arrange
      await page.goto('/');
      const preferLegacyFormatCheckbox = page.getByRole('checkbox', {name: preferLegacyFormatLabel});

      // Act
      await preferLegacyFormatCheckbox.focus();

      // Assert
      await expect(page.getByRole('tooltip')).toHaveText(preferLegacyFormatDescription);
      await expect(preferLegacyFormatCheckbox).toHaveAccessibleDescription(preferLegacyFormatDescription);
    });
  });

  test.describe('When the merge section is shown', () => {
    test('should align the edge of the legacy format checkbox with the edge of the save inputs', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      const saveAInputLeft = (await page.getByLabel('Save A:').boundingBox())!.x;
      const saveBInputLeft = (await page.getByLabel('Save B:').boundingBox())!.x;
      const checkboxLeft = (await page.getByRole('checkbox', {name: preferLegacyFormatLabel}).boundingBox())!.x;

      // Assert
      expect(saveBInputLeft).toBeCloseTo(saveAInputLeft, 0);
      expect(checkboxLeft).toBeCloseTo(saveAInputLeft, 0);
    });
  });
});
