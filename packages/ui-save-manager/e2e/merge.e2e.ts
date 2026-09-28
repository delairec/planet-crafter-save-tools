import {readFile} from 'node:fs/promises';
import {type Download, type Page} from '@playwright/test';
import {holdEveryFileRead, holdTheFileReadsAgain, releaseTheHeldFileReads} from './helpers/holdEveryFileRead';
import {expect, test} from './scenarioTest';
import {chooseTheTwoSavesToMerge, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const saveAFixturePath = locateTheFixture('baseline_valid.json');
const saveBFixturePath = locateTheFixture('other-player_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');
const skeoUpdateFixturePath = locateTheFixture('skeo-update_valid.json');
const energyConsumptionFixturePath = locateTheFixture('energy-consumption_valid.json');
const invalidSaveFixturePath = locateTheFixture('negative-gauge_invalid.json');

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

async function mergeAnotherPairOfSaves(page: Page, chosenSaveAPath: string, chosenSaveBPath: string): Promise<void> {
  await chooseTheTwoSavesToMerge(page, chosenSaveAPath, chosenSaveBPath);
  await mergeTheChosenSaves(page);
}

async function mergeFivePairsOfSaves(page: Page): Promise<void> {
  await mergeTheTwoFixtures(page);
  await mergeAnotherPairOfSaves(page, saveAFixturePath, legacySaveFixturePath);
  await mergeAnotherPairOfSaves(page, saveAFixturePath, skeoUpdateFixturePath);
  await mergeAnotherPairOfSaves(page, saveAFixturePath, energyConsumptionFixturePath);
  await mergeAnotherPairOfSaves(page, saveBFixturePath, saveAFixturePath);
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
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: baseline_valid.json');
    });
  });

  test.describe('When the reader leaves the Merge two saves page for Load save and comes back', () => {
    test('should show the last merge result again with its merged save still downloadable', async ({page}) => {
      // Arrange
      await mergeTheTwoFixtures(page);
      await openThePageOfTheMenu(page, 'Load save');

      // Act
      await openThePageOfTheMenu(page, 'Merge two saves');

      // Assert
      await expect(page.getByTestId('merged-file-name')).toHaveText(mergedFileName);
      expect((await downloadTheProducedFile(page)).suggestedFilename()).toBe(mergedFileName);
    });
  });

  test.describe('When six merges produced a file', () => {
    test('should keep the five last merged saves, the earlier ones listed newest first below the last result', async ({page}) => {
      // Arrange
      await mergeFivePairsOfSaves(page);

      // Act
      await mergeAnotherPairOfSaves(page, legacySaveFixturePath, saveAFixturePath);

      // Assert
      await expect(page.getByTestId('merged-file-name')).toHaveText('legacy-format_valid-baseline_valid-merged.json');
      await expect(page.getByTestId('earlier-merged-save-file-name')).toHaveText([
        'other-player_valid-baseline_valid-merged.json',
        'baseline_valid-energy-consumption_valid-merged.json',
        'baseline_valid-skeo-update_valid-merged.json',
        'baseline_valid-legacy-format_valid-merged.json'
      ]);
    });

    test('should offer each earlier merged save for download under its name', async ({page}) => {
      // Arrange
      await mergeTheTwoFixtures(page);
      await mergeAnotherPairOfSaves(page, saveAFixturePath, legacySaveFixturePath);
      const downloadStarted = page.waitForEvent('download');

      // Act
      await page.getByTestId('earlier-merged-save-download').click();

      // Assert
      expect((await downloadStarted).suggestedFilename()).toBe(mergedFileName);
    });

    test('should list the earlier merged saves below the last merge result', async ({page}) => {
      // Arrange
      await mergeTheTwoFixtures(page);

      // Act
      await mergeAnotherPairOfSaves(page, saveAFixturePath, legacySaveFixturePath);

      // Assert
      const lastResultTop = (await page.getByTestId('merged-file-name').boundingBox())!.y;
      const earlierMergedSavesTop = (await page.getByTestId('earlier-merged-saves-title').boundingBox())!.y;
      expect(lastResultTop).toBeLessThan(earlierMergedSavesTop);
    });
  });

  test.describe('When a merge refused by validation follows five merges that produced a file', () => {
    test('should keep the five merged saves, none dropped', async ({page}) => {
      // Arrange
      await mergeFivePairsOfSaves(page);
      await chooseTheTwoSavesToMerge(page, invalidSaveFixturePath, saveAFixturePath);

      // Act
      await page.getByTestId('merge').click();

      // Assert
      await expect(page.getByTestId('save-a-errors-title')).toBeVisible();
      await expect(page.getByTestId('earlier-merged-save-file-name')).toHaveText([
        'other-player_valid-baseline_valid-merged.json',
        'baseline_valid-energy-consumption_valid-merged.json',
        'baseline_valid-skeo-update_valid-merged.json',
        'baseline_valid-legacy-format_valid-merged.json',
        mergedFileName
      ]);
    });
  });

  test.describe('When a merge runs after a merge that produced a file', () => {
    test('should clear the last merge result and keep the merged save listed and downloadable', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await chooseTheTwoSaves(page, saveAFixturePath, saveBFixturePath);
      await page.getByTestId('merge').click();
      await releaseTheHeldFileReads(page);
      await expect(page.getByTestId('merge-success-message')).toBeVisible();
      await holdTheFileReadsAgain(page);

      // Act
      await page.getByTestId('merge').click();

      // Assert
      await expect(page.getByTestId('merge-busy-indicator')).toBeVisible();
      await expect(page.getByTestId('merge-success-message')).toBeHidden();
      await expect(page.getByTestId('earlier-merged-save-file-name')).toHaveText([mergedFileName]);
      await expect(page.getByTestId('earlier-merged-save-download')).toHaveAttribute('href', /^blob:/);
    });
  });
});
