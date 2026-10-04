import {expect, test} from '../scenarioTest';
import {locateTheFixture, visualizeTheSave} from '../scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');

test.describe('Players page accessibility', () => {
  test.describe('When the Players page is opened on a screen 360 pixels wide', () => {
    test.use({viewport: {width: 360, height: 800}});

    test('should name the button that unfolds the equipment of a player and say it is folded', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('menu-button').click();

      // Act
      await page.getByTestId('more-players').click();

      // Assert
      await expect(page.getByTestId('player-0-show-equipment')).toHaveRole('button');
      await expect(page.getByTestId('player-0-show-equipment')).toHaveAccessibleName(/^Equipment/);
      await expect(page.getByTestId('player-0-show-equipment')).toHaveAttribute('aria-expanded', 'false');
    });

    test('should say the equipment of a player is unfolded once its button is pressed', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await page.getByTestId('menu-button').click();
      await page.getByTestId('more-players').click();

      // Act
      await page.getByTestId('player-0-show-equipment').click();

      // Assert
      await expect(page.getByTestId('player-0-show-equipment')).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
