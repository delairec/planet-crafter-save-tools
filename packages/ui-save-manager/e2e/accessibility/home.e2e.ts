import {createAColorRulesAudit} from '../helpers/createAColorRulesAudit';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, visualizeTheSave} from '../scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

test.describe('Home page accessibility', () => {
  test.describe('When the home page opens before a save is loaded', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await page.goto('/');
      await expect(page.getByTestId('home-page')).toBeVisible();

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    test.describe('When the dark color scheme is preferred', () => {
      test.use({colorScheme: 'dark'});

      test('should conform to the color rules of WCAG 2 at levels A and AA', async ({page}) => {
        // Arrange
        await page.goto('/');
        await expect(page.getByTestId('home-page')).toBeVisible();

        // Act
        const {violations} = await createAColorRulesAudit(page).analyze();

        // Assert
        expect(violations).toEqual(noViolation);
      });
    });
  });

  test.describe('When the home page opens once a save is loaded', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('application-title-link').click();
      await expect(page.getByTestId('home-loaded-save')).toBeVisible();

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    test.describe('When the dark color scheme is preferred', () => {
      test.use({colorScheme: 'dark'});

      test('should conform to the color rules of WCAG 2 at levels A and AA', async ({page}) => {
        // Arrange
        await visualizeTheSave(page, baselineSaveFixturePath);
        await page.getByTestId('application-title-link').click();
        await expect(page.getByTestId('home-loaded-save')).toBeVisible();

        // Act
        const {violations} = await createAColorRulesAudit(page).analyze();

        // Assert
        expect(violations).toEqual(noViolation);
      });
    });

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
