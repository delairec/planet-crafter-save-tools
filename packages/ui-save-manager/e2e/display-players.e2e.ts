import {expect, test} from '@playwright/test';
import {findTheBreadcrumbSteps, findTheMenu, visualizeTheSave} from './saveManagerShell';

const otherPlayerSaveFixturePath = new URL('./fixtures/other-player_valid.json', import.meta.url).pathname;

test.describe('Players page', () => {
  test.describe('When the See more button of the Players group is pressed', () => {
    test('should display the players of the save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, otherPlayerSaveFixturePath);

      // Act
      await findTheMenu(page).getByRole('button', {name: 'See more'}).click();

      // Assert
      await expect(page.getByRole('heading', {name: 'Players', level: 3})).toBeVisible();
      await expect(page.getByRole('heading', {name: 'Sakia', level: 4})).toBeVisible();
    });

    test('should open on a breadcrumb naming the Players group and the Players page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, otherPlayerSaveFixturePath);

      // Act
      await findTheMenu(page).getByRole('button', {name: 'See more'}).click();

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Players', 'All players']);
    });
  });
});
