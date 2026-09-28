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

    test('should show the global progression first, the modifiers next and the unlocks last', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId(/^(global-progression|modifiers|unlocks)-title$/)).toHaveText(['Global progression', 'Modifiers', 'Unlocks']);
    });

    test('should state the game defaults in the summary of the modifiers', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId('modifiers-summary')).toHaveText("100\u00A0% and ×1 are the game's defaults");
    });

    test('should show a percentage modifier below 100 % as helping the player', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      const terraformationPace = page.getByTestId(/^modifier-\d+$/).filter({hasText: 'Terraformation Pace'});
      await expect(terraformationPace.getByTestId(/^modifier-\d+-badge$/)).toContainText('10\u00A0%');
      await expect(terraformationPace.getByTestId(/^modifier-\d+-badge-tone$/)).toHaveText(', helps the player');
    });

    test('should show a coefficient modifier below 1 as penalising the player', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      const gaugeDrain = page.getByTestId(/^modifier-\d+$/).filter({hasText: 'Gauge Drain'});
      await expect(gaugeDrain.getByTestId(/^modifier-\d+-badge$/)).toContainText('×\u00A00.3');
      await expect(gaugeDrain.getByTestId(/^modifier-\d+-badge-tone$/)).toHaveText(', penalises the player');
    });

    test('should list each unlock flag of the save with an on or off pill', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId(/^unlock-\d+$/)).toContainText([
        'Free craft', 'Everything unlocked', 'Space trading', 'Ore extractors',
        'Teleporters', 'Drones', 'Autocrafter', 'Randomized mineables'
      ]);
      await expect(page.getByTestId(/^unlock-\d+-state$/)).toHaveText(['off', 'off', 'off', 'off', 'off', 'off', 'off', 'off']);
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
    test('should show the drone logistics as a Paused badge penalising the player', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Configuration');

      // Assert
      await expect(page.getByTestId('drone-logistics-badge')).toContainText('Paused');
      await expect(page.getByTestId('drone-logistics-badge-tone')).toHaveText(', penalises the player');
    });
  });
});
