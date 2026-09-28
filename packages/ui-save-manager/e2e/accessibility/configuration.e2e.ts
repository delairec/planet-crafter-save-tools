import {type Page} from '@playwright/test';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from '../scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

async function openTheConfigurationPageOfAVisualizedSave(page: Page): Promise<void> {
  await visualizeTheSave(page, baselineSaveFixturePath);
  await openThePageOfTheMenu(page, 'Configuration');
  await expect(page.getByTestId('save-configuration-title')).toBeVisible();
}

test.describe('Configuration page accessibility', () => {
  test.describe('When the Configuration page of a visualized save is opened', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await openTheConfigurationPageOfAVisualizedSave(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    test('should title the save configuration with a third level heading', async ({page}) => {
      // Act
      await openTheConfigurationPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('save-configuration-title')).toHaveRole('heading');
      await expect(page.getByTestId('save-configuration-title')).toHaveAccessibleName('Save Configuration: Merged Save (Standard)');
      await expect(page.getByTestId('save-configuration-title')).toMatchAriaSnapshot('- heading [level=3]');
    });
  });
});
