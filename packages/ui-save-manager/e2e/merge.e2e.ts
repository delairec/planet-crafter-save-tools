import {readFile} from 'node:fs/promises';
import {type Download, type Page} from '@playwright/test';
import {expect, test} from './scenarioTest';
import {chooseTheTwoSavesToMerge, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const saveAFixturePath = locateTheFixture('baseline_valid.json');
const saveBFixturePath = locateTheFixture('other-player_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');

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

const preferLegacyFormatDescription =
  'Tick this checkbox if you want to align the save format on the older version instead of the newer.';

const keepLegacyFormatReminder = 'To write the legacy format instead, tick "Prefer legacy format" and merge again.';

async function chooseTheTwoSaves(page: Page, chosenSaveAPath: string, chosenSaveBPath: string): Promise<void> {
  await page.goto('/merge');
  await page.getByTestId('save-a').setInputFiles(chosenSaveAPath);
  await page.getByTestId('save-b').setInputFiles(chosenSaveBPath);
}

async function mergeTheChosenSaves(page: Page): Promise<void> {
  await page.getByTestId('merge').click();
  await expect(page.getByTestId('merge-success-message')).toBeVisible();
}

async function mergeAndRevealTheMergeReport(page: Page): Promise<void> {
  await mergeTheChosenSaves(page);
  await page.getByTestId('merge-warnings-details').click();
}

async function mergeTheTwoFixtures(page: Page): Promise<void> {
  await chooseTheTwoSaves(page, saveAFixturePath, saveBFixturePath);
  await mergeTheChosenSaves(page);
}

async function downloadTheProducedFile(page: Page): Promise<Download> {
  const downloadStarted = page.waitForEvent('download');
  await page.getByTestId('merged-save-download').click();

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
      await expect(page.getByTestId('merged-file-name')).toHaveText(mergedFileName);

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
      await expect(page.getByTestId('merge-warnings-title')).toHaveText('Merge warnings');
      await expect(page.getByTestId('merge-warnings-messages')).toContainText('The two saves carry different formats; the merged save is written in the format of release 2.004.');
      await expect(page.getByTestId('keep-legacy-format-reminder')).toHaveText(keepLegacyFormatReminder);
      await expect(page.getByTestId('merge-warnings-messages')).not.toContainText('merged-save-format');
    });

    test('should show the merge report and the way to keep the legacy format above the success message', async ({page}) => {
      // Arrange
      await chooseTheTwoSaves(page, legacySaveFixturePath, saveAFixturePath);

      // Act
      await mergeAndRevealTheMergeReport(page);

      // Assert
      const successMessageTop = (await page.getByTestId('merge-success-message').boundingBox())!.y;
      const mergeWarningsTitleTop = (await page.getByTestId('merge-warnings-title').boundingBox())!.y;
      const keepLegacyFormatReminderTop = (await page.getByTestId('keep-legacy-format-reminder').boundingBox())!.y;
      expect(mergeWarningsTitleTop).toBeLessThan(successMessageTop);
      expect(keepLegacyFormatReminderTop).toBeLessThan(successMessageTop);
    });
  });

  test.describe('When a legacy save is merged with a current one, the legacy format being asked for', () => {
    test('should hand over a merged save written in the legacy format', async ({page}) => {
      // Arrange
      await chooseTheTwoSaves(page, legacySaveFixturePath, saveAFixturePath);
      await page.getByTestId('prefer-legacy-format').check();
      await mergeTheChosenSaves(page);

      // Act
      const downloadedContent = await readTheDownloadedFile(page);

      // Assert
      expect(downloadedContent).toContain(legacyTerrainLayerEntry);
    });
  });

  test.describe('When the legacy format checkbox takes the keyboard focus', () => {
    test('should show the tooltip that describes it', async ({page}) => {
      // Arrange
      await page.goto('/merge');
      const preferLegacyFormatCheckbox = page.getByTestId('prefer-legacy-format');

      // Act
      await preferLegacyFormatCheckbox.focus();

      // Assert
      await expect(page.getByTestId('prefer-legacy-format-description')).toHaveText(preferLegacyFormatDescription);
    });
  });

  test.describe('When the merge section is shown', () => {
    test('should align the edge of the legacy format checkbox with the edge of the save inputs', async ({page}) => {
      // Arrange
      await page.goto('/merge');

      // Act
      const saveAInputLeft = (await page.getByTestId('save-a').boundingBox())!.x;
      const saveBInputLeft = (await page.getByTestId('save-b').boundingBox())!.x;
      const checkboxLeft = (await page.getByTestId('prefer-legacy-format').boundingBox())!.x;

      // Assert
      expect(saveBInputLeft).toBeCloseTo(saveAInputLeft, 0);
      expect(checkboxLeft).toBeCloseTo(saveAInputLeft, 0);
    });
  });

  test.describe('When a merge produces a result while a save is loaded', () => {
    test('should leave the loaded save in the Overview page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, saveAFixturePath);
      await openThePageOfTheMenu(page, 'Merge two saves');
      await chooseTheTwoSavesToMerge(page, saveAFixturePath, saveBFixturePath);
      await mergeTheChosenSaves(page);

      // Act
      await openThePageOfTheMenu(page, 'Overview');

      // Assert
      await expect(page.getByRole('heading', {name: 'Loaded save: baseline_valid.json'})).toBeVisible();
    });
  });
});
