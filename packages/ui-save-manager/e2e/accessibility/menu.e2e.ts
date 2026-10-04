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
});
