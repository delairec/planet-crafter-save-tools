import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, visualizeTheSave} from './scenarioSteps';

const otherPlayerSaveFixturePath = locateTheFixture('other-player_valid.json');

test.describe('Players page', () => {
  test.describe('When the See more button of the Players group is pressed', () => {
    test('should display the players of the save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('see-more-players-button').click();

      // Assert
      await expect(page.getByTestId('players-title')).toHaveText('Players');
      await expect(page.getByTestId(/^player-name-\d+$/)).toContainText(['Sakia']);
    });

    test('should open on a breadcrumb naming the Players group and the Players page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('see-more-players-button').click();

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Players', 'All players']);
    });
  });
});
