import {type Page} from '@playwright/test';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {describeTheColorRulesAuditInTheDarkColorScheme} from '../helpers/describeTheColorRulesAuditInTheDarkColorScheme';
import {holdEveryFileRead} from '../helpers/holdEveryFileRead';
import {triggerSaveFileMerge} from '../helpers/triggerSaveFileMerge';
import {expect, test} from '../scenarioTest';
import {locateTheFixture} from '../scenarioSteps';

const saveAFixturePath = locateTheFixture('baseline_valid.json');
const saveBFixturePath = locateTheFixture('other-player_valid.json');

async function openTheMergePage(page: Page): Promise<void> {
  await page.goto('/merge');
}

async function showAMergeResult(page: Page): Promise<void> {
  await openTheMergePage(page);
  await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);
  await expect(page.getByTestId('merge-success-message')).toBeVisible();
}

async function showTwoMergeResults(page: Page): Promise<void> {
  await showAMergeResult(page);
  await triggerSaveFileMerge(page, saveBFixturePath, saveAFixturePath);
  await expect(page.getByTestId('merged-file-name')).toHaveText('other-player_valid-baseline_valid-merged.json');
}

test.describe('Merge two saves page accessibility', () => {
  test.describe('When the page opens', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await openTheMergePage(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    describeTheColorRulesAuditInTheDarkColorScheme(openTheMergePage);

    test('should title the page with a third level heading', async ({page}) => {
      // Act
      await page.goto('/merge');

      // Assert
      await expect(page.getByTestId('merge-title')).toHaveRole('heading');
      await expect(page.getByTestId('merge-title')).toHaveAccessibleName('Merge two saves');
      await expect(page.getByTestId('merge-title')).toMatchAriaSnapshot('- heading [level=3]');
    });

    test('should name each save area as a group', async ({page}) => {
      // Act
      await page.goto('/merge');

      // Assert
      await expect(page.getByTestId('merge-area')).toHaveRole('group');
      await expect(page.getByTestId('merge-area')).toHaveAccessibleName('Merge two saves');
      await expect(page.getByTestId('save-a-area')).toHaveRole('group');
      await expect(page.getByTestId('save-a-area')).toHaveAccessibleName('Save A');
      await expect(page.getByTestId('save-b-area')).toHaveRole('group');
      await expect(page.getByTestId('save-b-area')).toHaveAccessibleName('Save B');
    });

    test('should label each save file input', async ({page}) => {
      // Act
      await page.goto('/merge');

      // Assert
      await expect(page.getByTestId('save-a')).toHaveAccessibleName('Save A');
      await expect(page.getByTestId('save-b')).toHaveAccessibleName('Save B');
    });

    test('should name the merge button by its text', async ({page}) => {
      // Act
      await page.goto('/merge');

      // Assert
      await expect(page.getByTestId('merge')).toHaveRole('button');
      await expect(page.getByTestId('merge')).toHaveAccessibleName('Merge');
    });

    test('should name the swap button by its tooltip', async ({page}) => {
      // Act
      await page.goto('/merge');

      // Assert
      await expect(page.getByTestId('swap-saves-description')).toHaveRole('tooltip');
      await expect(page.getByTestId('swap-saves')).toHaveRole('button');
      await expect(page.getByTestId('swap-saves')).toHaveAccessibleName('Swap save A and save B');
    });

    test('should describe the legacy format checkbox by its tooltip', async ({page}) => {
      // Act
      await page.goto('/merge');

      // Assert
      await expect(page.getByTestId('prefer-legacy-format-description')).toHaveRole('tooltip');
      await expect(page.getByTestId('prefer-legacy-format')).toHaveAccessibleDescription(
        'Tick this checkbox if you want to align the save format on the older version instead of the newer.'
      );
    });
  });

  test.describe('When two save files are being read for a merge', () => {
    test('should announce the busy indicator as a status', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await page.goto('/merge');

      // Act
      await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);

      // Assert
      await expect(page.getByTestId('merge-busy-indicator')).toHaveRole('status');
    });
  });

  test.describe('When a merge result is shown', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await showAMergeResult(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    describeTheColorRulesAuditInTheDarkColorScheme(showAMergeResult);

    test('should offer the merged save as a download link', async ({page}) => {
      // Act
      await showAMergeResult(page);

      // Assert
      await expect(page.getByTestId('merged-save-download')).toHaveRole('link');
      await expect(page.getByTestId('merged-save-download')).toHaveAccessibleName('Download');
    });
  });

  test.describe('When earlier merged saves are kept', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await showTwoMergeResults(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    describeTheColorRulesAuditInTheDarkColorScheme(showTwoMergeResults);

    test('should title the earlier merged saves with a fourth level heading', async ({page}) => {
      // Act
      await showTwoMergeResults(page);

      // Assert
      await expect(page.getByTestId('earlier-merged-saves-title')).toHaveAccessibleName('Earlier merged saves');
      await expect(page.getByTestId('earlier-merged-saves-title')).toMatchAriaSnapshot('- heading [level=4]');
    });

    test('should offer each earlier merged save as a download link', async ({page}) => {
      // Act
      await showTwoMergeResults(page);

      // Assert
      await expect(page.getByTestId('earlier-merged-save-download-0')).toHaveRole('link');
      await expect(page.getByTestId('earlier-merged-save-download-0')).toHaveAccessibleName('Download');
    });
  });
});
