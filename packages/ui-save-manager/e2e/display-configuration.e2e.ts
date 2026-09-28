import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const skeoUpdateSaveFixturePath = locateTheFixture('skeo-update_valid.json');

test.describe('Configuration page', () => {
  test.describe('When the Configuration page of a visualized save is opened', () => {
    test('should open on a section title naming the Configuration page', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId('configuration-title')).toHaveText('Configuration');
    });

    test('should display the save configuration and the global progression of that file', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId('save-configuration-title')).toHaveText('Save Configuration');
      await expect(page.getByTestId('save-configuration-summary')).toHaveText('Merged Save (Standard)');
      await expect(page.getByTestId('global-progression-title')).toHaveText('Global progression');
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
      const droneLogisticsField = page.getByTestId(/^global-progression-field-\d+$/).filter({hasText: 'Drone logistics'});
      await expect(droneLogisticsField.getByTestId(/^global-progression-field-\d+-value-\d+$/)).toHaveText('Paused');
    });
  });
});
