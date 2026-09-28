import AxeBuilder from '@axe-core/playwright';
import {expect, test, type Page} from '@playwright/test';
import {holdEveryFileRead} from './helpers/holdEveryFileRead';
import {triggerSaveFileMerge} from './helpers/triggerSaveFileMerge';
import {visualizeSave} from './helpers/visualizeSave';

const saveAFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const saveBFixturePath = new URL('./fixtures/other-player_valid.json', import.meta.url).pathname;
const legacySaveFixturePath = new URL('./fixtures/legacy-format_valid.json', import.meta.url).pathname;

const wcag2LevelAAndAaTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'];
const noViolation: readonly unknown[] = [];

async function auditTheWcag2Conformance(page: Page) {
  const audit = await new AxeBuilder({page}).withTags(wcag2LevelAAndAaTags).analyze();
  return audit.violations;
}

async function showASaveVisualization(page: Page): Promise<void> {
  await page.goto('/');
  await visualizeSave(page, saveAFixturePath);
  await expect(page.getByTestId('save-configuration-title')).toBeVisible();
}

async function showAMergeResult(page: Page): Promise<void> {
  await page.goto('/');
  await triggerSaveFileMerge(page, saveAFixturePath, saveBFixturePath);
  await expect(page.getByTestId('merge-success-message')).toBeVisible();
}

test.describe('Save manager accessibility', () => {
  test.describe('When the page opens before a save is loaded', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      const violations = await auditTheWcag2Conformance(page);

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
      await expect(page.getByTestId('save-file-input')).toHaveAccessibleName('Save file:');
      await expect(page.getByTestId('save-a-input')).toHaveAccessibleName('Save A:');
      await expect(page.getByTestId('save-b-input')).toHaveAccessibleName('Save B:');
    });

    test('should name the buttons that run an action by their text', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('visualize-button')).toHaveRole('button');
      await expect(page.getByTestId('visualize-button')).toHaveAccessibleName('Visualize');
      await expect(page.getByTestId('merge-button')).toHaveRole('button');
      await expect(page.getByTestId('merge-button')).toHaveAccessibleName('Merge');
    });

    test('should name the swap button by its tooltip', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('swap-button-tooltip')).toHaveRole('tooltip');
      await expect(page.getByTestId('swap-button')).toHaveRole('button');
      await expect(page.getByTestId('swap-button')).toHaveAccessibleName('Swap save A and save B');
    });

    test('should describe the legacy format checkbox by its tooltip', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByTestId('prefer-legacy-format-tooltip')).toHaveRole('tooltip');
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
      const violations = await auditTheWcag2Conformance(page);

      // Assert
      expect(violations).toEqual(noViolation);
    });

    test('should title its sections with third level headings', async ({page}) => {
      // Act
      await showASaveVisualization(page);

      // Assert
      await expect(page.getByTestId('save-configuration-title')).toHaveRole('heading');
      await expect(page.getByTestId('save-configuration-title')).toHaveAccessibleName('Save Configuration: Merged Save (Standard)');
      await expect(page.getByTestId('save-configuration-title')).toMatchAriaSnapshot('- heading [level=3]');
      await expect(page.getByTestId('energy-levels-title')).toHaveRole('heading');
      await expect(page.getByTestId('energy-levels-title')).toHaveAccessibleName('Power');
      await expect(page.getByTestId('energy-levels-title')).toMatchAriaSnapshot('- heading [level=3]');
    });

    test('should title each planet with a fourth level heading', async ({page}) => {
      // Act
      await showASaveVisualization(page);

      // Assert
      await expect(page.getByTestId('energy-levels-planet-title').first()).toHaveRole('heading');
      await expect(page.getByTestId('energy-levels-planet-title').first()).toHaveAccessibleName('Planet 1');
      await expect(page.getByTestId('energy-levels-planet-title').first()).toMatchAriaSnapshot('- heading [level=4]');
    });
  });

  test.describe('When the warnings of a visualized save are revealed', () => {
    test('should list each warning as a list item', async ({page}) => {
      // Arrange
      await page.goto('/');
      await visualizeSave(page, legacySaveFixturePath);

      // Act
      await page.getByTestId('display-warnings-details-toggle').click();

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
      const violations = await auditTheWcag2Conformance(page);

      // Assert
      expect(violations).toEqual(noViolation);
    });

    test('should offer the merged save as a download link', async ({page}) => {
      // Act
      await showAMergeResult(page);

      // Assert
      await expect(page.getByTestId('download-link')).toHaveRole('link');
      await expect(page.getByTestId('download-link')).toHaveAccessibleName('Download');
    });
  });
});
