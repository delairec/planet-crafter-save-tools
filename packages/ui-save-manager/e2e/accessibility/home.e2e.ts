import {type Page} from '@playwright/test';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {describeTheColorRulesAuditInTheDarkColorScheme} from '../helpers/describeTheColorRulesAuditInTheDarkColorScheme';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, visualizeTheSave} from '../scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

async function openTheHomePageBeforeASaveIsLoaded(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.getByTestId('home-page')).toBeVisible();
}

async function openTheHomePageOnceASaveIsLoaded(page: Page): Promise<void> {
  await visualizeTheSave(page, baselineSaveFixturePath);
  await page.getByTestId('application-title-link').click();
  await expect(page.getByTestId('home-loaded-save')).toBeVisible();
}

test.describe('Home page accessibility', () => {
  test.describe('When the home page opens before a save is loaded', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await openTheHomePageBeforeASaveIsLoaded(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    describeTheColorRulesAuditInTheDarkColorScheme(openTheHomePageBeforeASaveIsLoaded);
  });

  test.describe('When the home page opens once a save is loaded', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await openTheHomePageOnceASaveIsLoaded(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    describeTheColorRulesAuditInTheDarkColorScheme(openTheHomePageOnceASaveIsLoaded);

    test('should name the card of the loaded save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('application-title-link').click();

      // Assert
      await expect(page.getByTestId('home-loaded-save')).toHaveAccessibleName('Loaded save');
    });
  });
});
