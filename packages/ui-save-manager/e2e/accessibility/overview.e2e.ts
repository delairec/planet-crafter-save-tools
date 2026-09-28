import {type Page} from '@playwright/test';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {holdEveryFileRead} from '../helpers/holdEveryFileRead';
import {visualizeSave} from '../helpers/visualizeSave';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, visualizeTheSave} from '../scenarioSteps';

const saveAFixturePath = locateTheFixture('baseline_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');

async function showASaveVisualization(page: Page): Promise<void> {
  await visualizeTheSave(page, saveAFixturePath);
  await expect(page.getByTestId('loaded-save-title')).toBeVisible();
}

test.describe('Overview page accessibility', () => {
  test.describe('When the page opens before a save is loaded', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await page.goto('/load-save');

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    test('should name the display area as a group', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page.getByTestId('display-area')).toHaveRole('group');
      await expect(page.getByTestId('display-area')).toHaveAccessibleName('Display a save\'s data');
    });

    test('should label the save file input', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page.getByTestId('save-file')).toHaveAccessibleName('Save file:');
    });

    test('should name the visualize button by its text', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page.getByTestId('visualize')).toHaveRole('button');
      await expect(page.getByTestId('visualize')).toHaveAccessibleName('Visualize');
    });

    test('should title the display area with a second level heading', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page.getByTestId('display-title')).toHaveRole('heading');
      await expect(page.getByTestId('display-title')).toHaveAccessibleName('Display a save\'s data');
      await expect(page.getByTestId('display-title')).toMatchAriaSnapshot('- heading [level=2]');
    });

    test('should mark the version footer as the page footer', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page.getByTestId('application-version')).toHaveRole('contentinfo');
    });
  });

  test.describe('When a save file is being read for display', () => {
    test('should announce the busy indicator as a status', async ({page}) => {
      // Arrange
      await holdEveryFileRead(page);
      await page.goto('/load-save');

      // Act
      await visualizeSave(page, saveAFixturePath);

      // Assert
      await expect(page.getByTestId('display-busy-indicator')).toHaveRole('status');
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
      await expect(page.getByTestId('display-warnings-message-0')).toHaveRole('listitem');
    });
  });
});
