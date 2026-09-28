import {type Page} from '@playwright/test';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from '../scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

async function openTheConfigurationPageOfAVisualizedSave(page: Page): Promise<void> {
  await visualizeTheSave(page, baselineSaveFixturePath);
  await openThePageOfTheMenu(page, 'Configuration');
  await expect(page.getByTestId('modifiers-title')).toBeVisible();
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

    test('should title the page with a third level heading', async ({page}) => {
      // Act
      await openTheConfigurationPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('configuration-title')).toHaveRole('heading');
      await expect(page.getByTestId('configuration-title')).toHaveAccessibleName('Configuration');
      await expect(page.getByTestId('configuration-title')).toMatchAriaSnapshot('- heading [level=3]');
    });

    test('should title the modifiers with a fourth level heading', async ({page}) => {
      // Act
      await openTheConfigurationPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('modifiers-title')).toHaveRole('heading');
      await expect(page.getByTestId('modifiers-title')).toHaveAccessibleName('Modifiers');
      await expect(page.getByTestId('modifiers-title')).toMatchAriaSnapshot('- heading [level=4]');
    });

    test('should read the tone of a modifier apart from its value', async ({page}) => {
      // Act
      await openTheConfigurationPageOfAVisualizedSave(page);

      // Assert
      const terraformationPace = page.getByTestId(/^modifier-\d+$/).filter({hasText: 'Terraformation Pace'});
      await expect(terraformationPace.getByTestId(/^modifier-\d+-badge$/)).toHaveText('10\u00A0%, helps the player');
    });

    test('should title the global progression with a fourth level heading', async ({page}) => {
      // Act
      await openTheConfigurationPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('global-progression-title')).toHaveRole('heading');
      await expect(page.getByTestId('global-progression-title')).toHaveAccessibleName('Global progression');
      await expect(page.getByTestId('global-progression-title')).toMatchAriaSnapshot('- heading [level=4]');
    });
  });
});
