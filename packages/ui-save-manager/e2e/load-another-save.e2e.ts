import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const otherPlayerSaveFixturePath = locateTheFixture('other-player_valid.json');

test.describe('Load another save page', () => {
  test.describe('When it is opened from the menu', () => {
    test('should open on a breadcrumb naming the Tools group and the Load another save page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Load another save');

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Tools', 'Load another save']);
    });
  });

  test.describe('When another save is visualized while a save is loaded', () => {
    test('should open the Overview page on the new save', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);
      await openThePageOfTheMenu(page, 'Load another save');
      await page.getByTestId('save-file').setInputFiles(otherPlayerSaveFixturePath);

      // Act
      await page.getByTestId('visualize').click();

      // Assert
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: other-player_valid.json');
      await expect(findTheBreadcrumbSteps(page)).toHaveCount(0);
    });
  });
});
