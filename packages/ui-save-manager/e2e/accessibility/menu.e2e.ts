import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {reachWithTheTabKey} from '../helpers/reachWithTheTabKey';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, visualizeTheSave} from '../scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

test.describe('Menu accessibility', () => {
  test.describe('When the keyboard moves through the menu of a visualized save', () => {
    test('should show a visible focus on the page link the Tab key reaches', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await reachWithTheTabKey(page, page.getByTestId('power-page-link'));

      // Assert
      await expect(page.getByTestId('power-page-link')).toHaveCSS('outline-style', 'solid');
    });

    test('should open the page of the link the Enter key presses', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await reachWithTheTabKey(page, page.getByTestId('power-page-link'));

      // Act
      await page.keyboard.press('Enter');

      // Assert
      await expect(page.getByTestId('power-title')).toBeVisible();
    });

    test('should show a visible focus on the See more button the Tab key reaches', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await reachWithTheTabKey(page, page.getByTestId('more-players'));

      // Assert
      await expect(page.getByTestId('more-players')).toHaveCSS('outline-style', 'solid');
    });
  });

  test.describe('When the menu of a visualized save is used on a screen 360 pixels wide', () => {
    test.use({viewport: {width: 360, height: 800}});

    test('should name the Menu button and say the menu is closed', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('menu-button')).toHaveRole('button');
      await expect(page.getByTestId('menu-button')).toHaveAccessibleName('Menu');
      await expect(page.getByTestId('menu-button')).toHaveAttribute('aria-expanded', 'false');
    });

    test('should open the menu as a dialog named Menu and say it is open', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('menu-button').click();

      // Assert
      await expect(page.getByTestId('menu-dialog')).toHaveRole('dialog');
      await expect(page.getByTestId('menu-dialog')).toHaveAccessibleName('Menu');
      await expect(page.getByTestId('menu-button')).toHaveAttribute('aria-expanded', 'true');
    });

    test('should move the focus into the menu as it opens', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('menu-button').click();

      // Assert
      await expect(page.getByTestId('menu-close')).toBeFocused();
    });

    test('should close the menu by the Escape key and give the focus back to the Menu button', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('menu-button').click();

      // Act
      await page.keyboard.press('Escape');

      // Assert
      await expect(page.getByTestId('overview-page-link')).toBeHidden();
      await expect(page.getByTestId('menu-button')).toBeFocused();
    });

    test('should conform to WCAG 2 at levels A and AA with the menu open', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('menu-button').click();

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });
  });
});
