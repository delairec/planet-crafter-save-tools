import {type Page} from '@playwright/test';
import {createAWcag2Audit, noViolation} from '../helpers/createAWcag2Audit';
import {describeTheColorRulesAuditInTheDarkColorScheme} from '../helpers/describeTheColorRulesAuditInTheDarkColorScheme';
import {expect, test} from '../scenarioTest';
import {locateTheFixture, openThePageOfTheMenu, visualizeTheSave} from '../scenarioSteps';

const baselineSaveFixturePath = locateTheFixture('baseline_valid.json');
const skeoUpdateSaveFixturePath = locateTheFixture('skeo-update_valid.json');

async function openThePowerPageOfAVisualizedSave(page: Page): Promise<void> {
  await visualizeTheSave(page, baselineSaveFixturePath);
  await openThePageOfTheMenu(page, 'Power');
  await expect(page.getByTestId('power-title')).toBeVisible();
}

async function openTheShareOfEachMachineTypeOfAVisualizedSave(page: Page): Promise<void> {
  await openThePowerPageOfAVisualizedSave(page);
  await page.getByTestId('power-display-form').selectOption({label: 'Share of each machine type'});
  await expect(page.getByTestId('power-share-production-title')).toBeVisible();
}

test.describe('Power page accessibility', () => {
  test.describe('When the Power page of a visualized save is opened', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await openThePowerPageOfAVisualizedSave(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    describeTheColorRulesAuditInTheDarkColorScheme(openThePowerPageOfAVisualizedSave);

    test('should title the power with a third level heading', async ({page}) => {
      // Act
      await openThePowerPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('power-title')).toHaveRole('heading');
      await expect(page.getByTestId('power-title')).toHaveAccessibleName('Power');
      await expect(page.getByTestId('power-title')).toMatchAriaSnapshot('- heading [level=3]');
    });

    test('should title the planet of the selected tab with a fourth level heading', async ({page}) => {
      // Act
      await openThePowerPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('power-planet-title')).toHaveRole('heading');
      await expect(page.getByTestId('power-planet-title')).toHaveAccessibleName(/^Planet 1\b/);
      await expect(page.getByTestId('power-planet-title')).toMatchAriaSnapshot('- heading [level=4]');
    });

    test('should offer the planets as tabs, the first one selected', async ({page}) => {
      // Act
      await openThePowerPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('power-planet-tab-0')).toHaveRole('tab');
      await expect(page.getByTestId('power-planet-tab-0')).toHaveAttribute('aria-selected', 'true');
    });

    test('should name the selector of the form by its Display as label', async ({page}) => {
      // Act
      await openThePowerPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('power-display-form')).toHaveRole('combobox');
      await expect(page.getByTestId('power-display-form')).toHaveAccessibleName('Display as');
    });

    test('should name a bar by its type and value and describe it by its tooltip', async ({page}) => {
      // Act
      await openThePowerPageOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('power-chart-production-bar-0')).toHaveAttribute('tabindex', '0');
      await expect(page.getByTestId('power-chart-production-bar-0')).toHaveAccessibleName(/\skW$/);
      await expect(page.getByTestId('power-chart-production-bar-0')).toHaveAccessibleDescription(/ × .* = /);
    });

    test('should let the keyboard reach the scrolling body of each table, a region named after its title, once Table is chosen', async ({page}) => {
      // Arrange
      await openThePowerPageOfAVisualizedSave(page);

      // Act
      await page.getByTestId('power-display-form').selectOption({label: 'Table'});

      // Assert
      await expect(page.getByTestId('power-optimizers-body')).toHaveRole('region');
      await expect(page.getByTestId('power-optimizers-body')).toHaveAccessibleName('Optimizers');
      await expect(page.getByTestId('power-optimizers-body')).toHaveAttribute('tabindex', '0');
      await expect(page.getByTestId('power-producers-body')).toHaveRole('region');
      await expect(page.getByTestId('power-producers-body')).toHaveAccessibleName('Producers');
      await expect(page.getByTestId('power-producers-body')).toHaveAttribute('tabindex', '0');
      await expect(page.getByTestId('power-consumers-body')).toHaveRole('region');
      await expect(page.getByTestId('power-consumers-body')).toHaveAccessibleName('Consumers');
      await expect(page.getByTestId('power-consumers-body')).toHaveAttribute('tabindex', '0');
    });
  });

  test.describe('When Share of each machine type is chosen on the Power page of a visualized save', () => {
    test('should conform to WCAG 2 at levels A and AA', async ({page}) => {
      // Arrange
      await openTheShareOfEachMachineTypeOfAVisualizedSave(page);

      // Act
      const {violations} = await createAWcag2Audit(page).analyze();

      // Assert
      expect(violations).toEqual(noViolation);
    });

    describeTheColorRulesAuditInTheDarkColorScheme(openTheShareOfEachMachineTypeOfAVisualizedSave);

    test('should name a segment by its type and describe it by its tooltip', async ({page}) => {
      // Act
      await openTheShareOfEachMachineTypeOfAVisualizedSave(page);

      // Assert
      await expect(page.getByTestId('power-share-production-segment-0')).toHaveAttribute('tabindex', '0');
      await expect(page.getByTestId('power-share-production-segment-0')).toHaveAccessibleName(/\S/);
      await expect(page.getByTestId('power-share-production-segment-0')).toHaveAccessibleDescription(/ of production$/);
    });
  });

  test.describe('When the Power page of a save written by the Skeo update is opened', () => {
    test('should read the severity of its notification apart from the message', async ({page}) => {
      // Arrange
      await visualizeTheSave(page, skeoUpdateSaveFixturePath);

      // Act
      await openThePageOfTheMenu(page, 'Power');

      // Assert
      const submergedMachinesNotification = page.getByTestId(/^power-notification-\d+$/)
        .filter({hasText: 'Submerged machines may distort the computed available energy.'});
      await expect(submergedMachinesNotification)
        .toMatchAriaSnapshot('- paragraph: /^Limitation ?:\\sSubmerged machines may distort the computed available energy\\.$/');
    });
  });
});
