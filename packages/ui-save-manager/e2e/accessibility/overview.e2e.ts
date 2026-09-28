import {type Page} from '@playwright/test';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {holdEveryFileRead} from '../helpers/holdEveryFileRead';
import {triggerSaveFileMerge} from '../helpers/triggerSaveFileMerge';
import {visualizeSave} from '../helpers/visualizeSave';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, visualizeTheSave} from '../scenarioSteps';

const saveAFixturePath = locateTheFixture('baseline_valid.json');
const saveBFixturePath = locateTheFixture('other-player_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');

async function showASaveVisualization(page: Page): Promise<void> {
  await visualizeTheSave(page, saveAFixturePath);
  await expect(page.getByTestId('loaded-save-title')).toBeVisible();
}

async function showAMergeResult(page: Page): Promise<void> {
  await page.goto('/');
  await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);
  await expect(page.getByTestId('merge-success-message')).toBeVisible();
}

test.describe('Overview page accessibility', () => {
  test.describe('When the page opens before a save is loaded', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    test('should name each save area as a group', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('display-area')).toHaveRole('group');
      await expect(page.getByTestId('display-area')).toHaveAccessibleName('Display a save\'s data');
      await expect(page.getByTestId('merge-area')).toHaveRole('group');
      await expect(page.getByTestId('merge-area')).toHaveAccessibleName('Merge two saves');
      await expect(page.getByTestId('save-a-area')).toHaveRole('group');
      await expect(page.getByTestId('save-a-area')).toHaveAccessibleName('Save A');
      await expect(page.getByTestId('save-b-area')).toHaveRole('group');
      await expect(page.getByTestId('save-b-area')).toHaveAccessibleName('Save B');
    });

    test('should label each save file input', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('save-file')).toHaveAccessibleName('Save file:');
      await expect(page.getByTestId('save-a')).toHaveAccessibleName('Save A:');
      await expect(page.getByTestId('save-b')).toHaveAccessibleName('Save B:');
    });

    test('should name the buttons that run an action by their text', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('visualize')).toHaveRole('button');
      await expect(page.getByTestId('visualize')).toHaveAccessibleName('Visualize');
      await expect(page.getByTestId('merge')).toHaveRole('button');
      await expect(page.getByTestId('merge')).toHaveAccessibleName('Merge');
    });

    test('should name the swap button by its tooltip', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('swap-saves-description')).toHaveRole('tooltip');
      await expect(page.getByTestId('swap-saves')).toHaveRole('button');
      await expect(page.getByTestId('swap-saves')).toHaveAccessibleName('Swap save A and save B');
    });

    test('should describe the legacy format checkbox by its tooltip', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('prefer-legacy-format-description')).toHaveRole('tooltip');
      await expect(page.getByTestId('prefer-legacy-format')).toHaveAccessibleDescription(
        'Tick this checkbox if you want to align the save format on the older version instead of the newer.'
      );
    });

    test('should title the visualization with a second level heading', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('visualization-title')).toHaveRole('heading');
      await expect(page.getByTestId('visualization-title')).toHaveAccessibleName('Visualization');
      await expect(page.getByTestId('visualization-title')).toMatchAriaSnapshot('- heading [level=2]');
    });

    test('should mark the version footer as the page footer', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('application-version')).toHaveRole('contentinfo');
    });
  });

  test.describe('When a save file is being read for display', () => {
    test('should announce the busy indicator as a status', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await page.goto('/');

      // Act
      await visualizeSave(page, saveAFixturePath);

      // Assert
      await expect(page.getByTestId('display-busy-indicator')).toHaveRole('status');
    });
  });

  test.describe('When two save files are being read for a merge', () => {
    test('should announce the busy indicator as a status', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await page.goto('/');

      // Act
      await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);

      // Assert
      await expect(page.getByTestId('merge-busy-indicator')).toHaveRole('status');
    });
  });

  test.describe('When a save is visualized', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await showASaveVisualization(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });
  });

  test.describe('When the warnings of a visualized save are revealed', () => {
    test('should list each warning as a list item', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, legacySaveFixturePath);

      // Act
      await page.getByTestId('display-warnings-details').click();

      // Assert
      await expect(page.getByTestId('display-warnings-messages')).toHaveRole('list');
      await expect(page.getByTestId('display-warnings-message').first()).toHaveRole('listitem');
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

    test('should offer the merged save as a download link', async ({page}) => {
      // Act
      await showAMergeResult(page);

      // Assert
      await expect(page.getByTestId('merged-save-download')).toHaveRole('link');
      await expect(page.getByTestId('merged-save-download')).toHaveAccessibleName('Download');
    });
  });
});
