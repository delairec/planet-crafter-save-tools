import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, visualizeTheSave} from './scenarioSteps';

const otherPlayerSaveFixturePath = locateTheFixture('other-player_valid.json');

test.describe('Players page', () => {
  test.describe('When the See more button of the Players group is pressed', () => {
    test('should display the players of the save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('more-players').click();

      // Assert
      await expect(page.getByTestId('players-title')).toHaveText('Players');
      await expect(page.getByTestId(/^player-name-\d+$/)).toContainText(['Sakia']);
    });

    test('should show the vital gauges of each player against their maximum', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('more-players').click();

      // Assert
      await expect(page.getByTestId('players-count')).toHaveText('1 in this save');
      await expect(page.getByTestId('player-0-gauge-oxygen-amount')).toHaveText('280 / 280');
      await expect(page.getByTestId('player-0-gauge-health-percentage')).toHaveText('73\u00a0%');
      await expect(page.getByTestId('player-0-gauge-thirst-amount')).toHaveText('96 / 100');
    });

    test('should show the equipment of each player as slots and their inventory grouped', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('more-players').click();

      // Assert
      await expect(page.getByTestId('player-0-equipment-caption')).toHaveText('Equipment · 2 of 20 slots');
      await expect(page.getByTestId('player-0-inventory-caption')).toHaveText('Inventory · 2 of 20 slots, 2 kinds');
      await expect(page.getByTestId('player-0-inventory-empty-slots')).toHaveText('Empty slots ×18');
    });

    test('should open on a breadcrumb naming the Players group and the Players page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('more-players').click();

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Players', 'All players']);
    });
  });
});
