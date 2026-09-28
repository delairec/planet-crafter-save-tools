import {type Page} from '@playwright/test';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from '../scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

async function openThePowerPageOfAVisualizedSave(page: Page): Promise<void> {
  await visualizeTheSave(page, baselineSaveFixturePath);
  await openThePageOfTheMenu(page, 'Power');
  await expect(page.getByTestId('energy-levels-title')).toBeVisible();
}

test.describe('Power page accessibility', () => {
  test.describe('When the Power page of a visualized save is opened', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await openThePowerPageOfAVisualizedSave(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    test('should title the power with a third level heading', async ({page}) => {
      // Act
      await openThePowerPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('energy-levels-title')).toHaveRole('heading');
      await expect(page.getByTestId('energy-levels-title')).toHaveAccessibleName('Power');
      await expect(page.getByTestId('energy-levels-title')).toMatchAriaSnapshot('- heading [level=3]');
    });

    test('should title each planet with a fourth level heading', async ({page}) => {
      // Act
      await openThePowerPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('energy-levels-planet-0-title')).toHaveRole('heading');
      await expect(page.getByTestId('energy-levels-planet-0-title')).toHaveAccessibleName('Planet 1');
      await expect(page.getByTestId('energy-levels-planet-0-title')).toMatchAriaSnapshot('- heading [level=4]');
    });
  });
});
