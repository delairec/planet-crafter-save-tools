import {expect, test} from './scenarioTest';
import {findTheBreadcrumbSteps, findTheMenuGroupTitles, locateTheFixture, visualizeTheSave} from './scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');
const skeoUpdateSaveFixturePath = locateTheFixture('skeo-update_valid.json');
const energyConsumptionSaveFixturePath = locateTheFixture('energy-consumption_valid.json');
const invalidSaveFixturePath = locateTheFixture('negative-gauge_invalid.json');

test.describe('Overview page', () => {
  test.describe('When no save is loaded', () => {
    test('should offer the display area, its file input and its Visualize button', async ({page}) => {
      // Act
      await page.goto('/load-save');

      // Assert
      await expect(page.getByTestId('display-area')).toBeVisible();
      await expect(page.getByTestId('save-file')).toBeVisible();
      await expect(page.getByTestId('visualize')).toBeDisabled();
    });
  });

  test.describe('When a valid save file is visualized', () => {
    test('should title the page with the display name of the save, its mode, its game release and its file size beside it', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-identity-title')).toHaveText('Merged Save');
      await expect(page.getByTestId('overview-identity-title-hint')).toHaveText('Standard · Game release 2.004 · 2.48 KB');
    });

    test('should show the progression tiles the save carries', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-all-time-terra-tokens-value')).toHaveText('200,345=tt=');
      await expect(page.getByTestId('overview-total-crafted-objects-value')).toHaveText('10');
      await expect(page.getByTestId('overview-drone-logistics')).toBeHidden();
    });

    test('should show the power notifications of the save under its identity title', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId(/^overview-notification-\d+$/)).toHaveCount(3);
      await expect(page.getByTestId(/^overview-notification-\d+$/)).toContainText([
        'Submerged machines may distort the computed available energy.',
        'Values of game release 2.004',
        "Consumption applies the save's Power Consumption modifier: 20%"
      ]);
      const identityTitleTop = (await page.getByTestId('overview-identity-title').boundingBox())!.y;
      const firstNotificationTop = (await page.getByTestId('overview-notification-0').boundingBox())!.y;
      expect(firstNotificationTop).toBeGreaterThan(identityTitleTop);
    });

    test('should title the Planets section with the count of planets the save carries', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-planets-title')).toHaveText('Planets');
      await expect(page.getByTestId('overview-planets-title-hint')).toHaveText('2 planets');
    });

    test('should give each planet a card named after it', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId(/^overview-planet-\d+-name$/)).toHaveText(['Toxicity', 'Planet 1']);
    });

    test('should offer on each planet card a Details button, disabled', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId(/^overview-planet-\d+-details$/)).toHaveText(['Details', 'Details']);
      await expect(page.getByTestId('overview-planet-0-details')).toHaveRole('button');
      await expect(page.getByTestId('overview-planet-0-details')).toBeDisabled();
    });

    test('should say in a tooltip over the Details button that the page of the planet comes in a later version', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Act
      await page.getByTestId('overview-planet-0-details').hover();

      // Assert
      await expect(page.getByTestId('overview-planet-0-details-description')).toBeVisible();
      await expect(page.getByTestId('overview-planet-0-details-description')).toHaveText('The page of the planet comes in a later version.');
    });

    test('should say no machine is placed in place of the power of a planet that places none', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-planet-0-absent-side')).toHaveText('No machine placed');
      await expect(page.getByTestId('overview-planet-0-production')).toBeHidden();
      const lastFigureTop = (await page.getByTestId('overview-planet-0-figure-4').boundingBox())!.y;
      const absentSideTop = (await page.getByTestId('overview-planet-0-absent-side').boundingBox())!.y;
      expect(absentSideTop).toBeGreaterThan(lastFigureTop);
    });

    test('should say no terraformation level is recorded in place of the figures of a planet that records none', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-planet-1-absent-side')).toHaveText('No terraformation level recorded');
      await expect(page.getByTestId('overview-planet-1-terraformation-index')).toBeHidden();
      const absentSideTop = (await page.getByTestId('overview-planet-1-absent-side').boundingBox())!.y;
      const productionTop = (await page.getByTestId('overview-planet-1-production').boundingBox())!.y;
      expect(absentSideTop).toBeLessThan(productionTop);
    });

    test('should read Overview alone in the breadcrumb and leave the pages of the save to the menu', async ({page}) => {
      // Act
      await visualizeTheSave(page, baselineSaveFixturePath);

      // Assert
      await expect(findTheBreadcrumbSteps(page)).toHaveText(['Overview']);
      await expect(page.getByTestId(/^overview-[a-z]+-page-link$/)).toHaveCount(0);
    });
  });

  test.describe('When a save written by the Skeo update is visualized', () => {
    test('should show the drone logistics as a Paused badge penalising the player', async ({page}) => {
      // Act
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-drone-logistics-badge')).toContainText('Paused');
      await expect(page.getByTestId('overview-drone-logistics-badge-tone')).toHaveText(', penalises the player');
    });
  });

  test.describe('When a save whose planet records terraformation levels and places machines is visualized', () => {
    test('should show the Terraformation Index of the planet and its figures', async ({page}) => {
      // Act
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-planet-0-terraformation-index')).toHaveText('2.8 kTi');
      await expect(page.getByTestId(/^overview-planet-0-figure-\d+-label$/)).toHaveText(['O²', 'Heat', 'Pressure', 'Purification', 'Biomass']);
      await expect(page.getByTestId(/^overview-planet-0-figure-\d+-value$/)).toHaveText(['100 ppq', '200 pK', '300 nPa', '700 Pu', '1.5 kg']);
    });

    test('should name the terraformation stage the planet has reached in a badge beside its name', async ({page}) => {
      // Act
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-planet-0-terraformation-stage')).toHaveText('Toxic wasteland');
      await expect(page.getByTestId('overview-planet-0-terraformation-stage-label')).toHaveText('Terraformation stage');
    });

    test('should show the SysTi of the save in a tile captioned with the count of planets it multiplies', async ({page}) => {
      // Act
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-system-terraformation-index-value')).toHaveText('2.8 kSysTi');
      await expect(page.getByTestId('overview-system-terraformation-index-caption')).toHaveText('multiplied over 1 planet');
    });

    test('should open the tiles on the SysTi, on the left', async ({page}) => {
      // Act
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-tiles').getByTestId(/-value$/).first()).toHaveText('2.8 kSysTi');
    });

    test('should show the power the planet produces, consumes and has available, and the share of its production consumed', async ({page}) => {
      // Act
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-planet-0-production')).toHaveText('497.25 kW');
      await expect(page.getByTestId('overview-planet-0-consumption')).toHaveText('285 kW');
      await expect(page.getByTestId('overview-planet-0-available')).toHaveText('+212.25 kW');
      await expect(page.getByTestId('overview-planet-0-share')).toHaveText('57% of production consumed');
    });

    test('should draw the consumption bar at the share of the production bar the consumption is', async ({page}) => {
      // Act
      await visualizeTheSave(page, energyConsumptionSaveFixturePath);

      // Assert
      const productionBarWidth = (await page.getByTestId('overview-planet-0-production-bar').boundingBox())!.width;
      const consumptionBarWidth = (await page.getByTestId('overview-planet-0-consumption-bar').boundingBox())!.width;
      expect(consumptionBarWidth / productionBarWidth).toBeCloseTo(0.57, 2);
    });
  });

  test.describe('When a save file written in the legacy format is visualized', () => {
    test('should load it without a validation error', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-identity-title-hint')).toHaveText('Standard · Game release 1.618 · 2.623 KB');
      await expect(page.getByTestId('display-errors-title')).toBeHidden();
    });

    test('should show its warnings above the content of the page', async ({page}) => {
      // Act
      await visualizeTheSave(page, legacySaveFixturePath);

      // Assert
      await expect(page.getByTestId('overview-identity-title')).toHaveText('Merged Save');
      const warningsTop = (await page.getByTestId('display-warnings-title').boundingBox())!.y;
      const identityTitleTop = (await page.getByTestId('overview-identity-title').boundingBox())!.y;
      expect(warningsTop).toBeLessThan(identityTitleTop);
    });
  });

  test.describe('When an invalid save file is visualized', () => {
    test('should list its errors and keep the Save and Players groups out of the menu', async ({page}) => {
      // Act
      await visualizeTheSave(page, invalidSaveFixturePath);

      // Assert
      await expect(page.getByTestId('display-errors-title')).toHaveText('Errors');
      await expect(findTheMenuGroupTitles(page)).toHaveText(['Tools']);
    });
  });

  test.describe('When reading the chosen save file fails', () => {
    test('should report the failure and leave the form usable', async ({page}) => {
      // Arrange
      await page.addInitScript(() => {
        const refuseToRead = () => Promise.reject(new Error('The file is no longer readable.'));
        Blob.prototype.text = refuseToRead;
        Blob.prototype.arrayBuffer = refuseToRead;
        Blob.prototype.stream = () => {
          throw new Error('The file is no longer readable.');
        };
      });
      await page.goto('/load-save');
      await page.getByTestId('save-file').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('visualize').click();

      // Assert
      await expect(page.getByTestId('display-failure-message')).toHaveText('The save file could not be displayed. Please try again.');
      await expect(page.getByTestId('save-file')).toHaveValue(/baseline_valid\.json$/);
      await expect(page.getByTestId('visualize')).toBeEnabled();
    });
  });

  test.describe('When the file selection is cancelled after a save file was chosen', () => {
    test('should leave no save file to visualize', async ({page}) => {
      // Arrange
      const noFileSelected: string[] = [];
      await page.goto('/load-save');
      await page.getByTestId('save-file').setInputFiles(baselineSaveFixturePath);

      // Act
      await page.getByTestId('save-file').setInputFiles(noFileSelected);

      // Assert
      await expect(page.getByTestId('visualize')).toBeDisabled();
    });
  });
});
