import {expect, test} from '@playwright/test';
import {findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const skeoUpdateSaveFixturePath = locateTheFixture('skeo-update_valid.json');

test.describe('Configuration page', () => {
  test.describe('When the Configuration page of a visualized save is opened', () => {
    test('should display the save configuration and the global progression of that file', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
      await expect(page.getByRole('heading', {name: 'Global progression'})).toBeVisible();
    });

    test('should open on a breadcrumb naming the Save group and the Configuration page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Save', 'Configuration']);
    });
  });

  test.describe('When the Configuration page of a save written by the Skeo update is opened', () => {
    test('should display the drone logistics as paused', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByText('Drone logistics')).toBeVisible();
      await expect(page.getByText('Paused', {exact: true})).toBeVisible();
    });
  });
});
