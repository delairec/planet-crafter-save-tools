import {expect, test} from '@playwright/test';
import {findTheBreadcrumbSteps, openThePageOfTheMenu, visualizeTheSave} from './saveManagerShell';

const baselineSaveFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;

test.describe('Terraformation page', () => {
  test.describe('When the Terraformation page of a visualized save is opened', () => {
    test('should display the terraformation levels of that file', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

      // Assert
      await expect(page.getByRole('heading', {name: 'Terraformation Levels', level: 3})).toBeVisible();
    });

    test('should open on a breadcrumb naming the Save group and the Terraformation page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Terraformation');

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Save', 'Terraformation']);
    });
  });
});
