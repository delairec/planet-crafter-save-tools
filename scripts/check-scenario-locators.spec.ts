import {describe, expect, it} from 'bun:test';
import {displayRouteLoadingLabel} from '../packages/ui-save-manager/src/messages/displayRouteMessages.js';
import {spinnerLoadingLabel} from '../packages/ui-save-manager/src/messages/spinnerMessages.js';
import {AMBIGUOUS_BUSY_LABEL, findScenarioLocatorViolations, isScenarioFile} from './check-scenario-locators.ts';

const TEST_IDENTIFIER_REASON = 'a scenario designates an element by what the screen shows, never by a test identifier';
const CSS_SELECTOR_REASON = 'a scenario designates an element by its role, its label or its text, never by a CSS selector';
const REFERENCE_SCREENSHOT_REASON = 'a scenario asserts what the screen shows in words, never against a reference screenshot';
const AMBIGUOUS_BUSY_LABEL_REASON = 'the busy indicator is designated by its status role, the hydration fallback carrying the same label';

describe('AMBIGUOUS_BUSY_LABEL', () => {

  describe('When the message modules the guard copies are read', () => {
    it('should hold the very label both of them export, a rewording of either failing here rather than disarming the guard', () => {
      // Assert
      expect(AMBIGUOUS_BUSY_LABEL).toBe(displayRouteLoadingLabel);
      expect(AMBIGUOUS_BUSY_LABEL).toBe(spinnerLoadingLabel);
    });
  });
});

describe('isScenarioFile', () => {

  describe('When the file is a scenario of a package', () => {
    it('should recognise it wherever that scenario sits under the end-to-end directory', () => {
      // Act
      const isFlatScenario = isScenarioFile('packages/ui-save-manager/e2e/merge.e2e.ts');
      const isNestedScenario = isScenarioFile('packages/ui-save-manager/e2e/flows/display.e2e.ts');

      // Assert
      expect(isFlatScenario).toBe(true);
      expect(isNestedScenario).toBe(true);
    });
  });

  describe('When the file is a unit spec or a fixture', () => {
    it('should leave it alone, the scenario suffix being what tells a scenario apart', () => {
      // Act
      const isUnitSpec = isScenarioFile('packages/ui-save-manager/src/lib/useLoadSaveFile.spec.ts');
      const isFixture = isScenarioFile('packages/ui-save-manager/e2e/fixtures/baseline_valid.json');

      // Assert
      expect(isUnitSpec).toBe(false);
      expect(isFixture).toBe(false);
    });
  });

  describe('When the file is generated', () => {
    it('should leave it alone even with the scenario suffix', () => {
      // Act
      const isInstalledDependency = isScenarioFile('node_modules/some-lib/e2e/thing.e2e.ts');
      const isBuildOutput = isScenarioFile('packages/ui-save-manager/.output/e2e/thing.e2e.ts');

      // Assert
      expect(isInstalledDependency).toBe(false);
      expect(isBuildOutput).toBe(false);
    });
  });
});

describe('findScenarioLocatorViolations', () => {

  describe('When a scenario designates an element by a test identifier', () => {
    it('should report the locator built for that identifier', () => {
      // Arrange
      const source = "await expect(page.getByTestId('merge-button')).toBeVisible();";

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([{line: 1, reason: TEST_IDENTIFIER_REASON}]);
    });

    it('should report the attribute asserted on an element', () => {
      // Arrange
      const source = "await expect(page.getByRole('listitem')).toHaveAttribute('data-testid', 'error-row');";

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([{line: 1, reason: TEST_IDENTIFIER_REASON}]);
    });
  });

  describe('When a scenario designates an element by a CSS selector', () => {
    it('should report the locator call that reads one', () => {
      // Arrange
      const source = "await expect(page.locator('.merge-result > p')).toBeVisible();";

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([{line: 1, reason: CSS_SELECTOR_REASON}]);
    });

    it('should report the query shorthands, the selector wait and the selector-taking action', () => {
      // Arrange
      const source = [
        "const first = await page.$('.merge-result');",
        "const all = await page.$$('.merge-result');",
        "await page.waitForSelector('.merge-result');",
        "await page.evaluate(() => document.querySelector('.merge-result'));",
        "await page.click('.merge-result > button');"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([
        {line: 1, reason: CSS_SELECTOR_REASON},
        {line: 2, reason: CSS_SELECTOR_REASON},
        {line: 3, reason: CSS_SELECTOR_REASON},
        {line: 4, reason: CSS_SELECTOR_REASON},
        {line: 5, reason: CSS_SELECTOR_REASON}
      ]);
    });

    it('should report the page actions whose first argument is a raw selector', () => {
      // Arrange
      const source = [
        "await page.dragAndDrop('.merge-result', '.trash');",
        "await page.setChecked('#keep-duplicates', true);",
        "const value = await page.inputValue('#save-a');"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([
        {line: 1, reason: CSS_SELECTOR_REASON},
        {line: 2, reason: CSS_SELECTOR_REASON},
        {line: 3, reason: CSS_SELECTOR_REASON}
      ]);
    });

    it('should report the frame locator whatever receives it, its argument being a raw selector in every case', () => {
      // Arrange
      const source = [
        "await page.frameLocator('#preview').getByRole('button').click();",
        "await page.getByRole('region').frameLocator('iframe.preview').getByRole('button').click();"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([
        {line: 1, reason: CSS_SELECTOR_REASON},
        {line: 2, reason: CSS_SELECTOR_REASON}
      ]);
    });

    it('should leave a locator method alone when the page itself is the receiver of a legitimate call', () => {
      // Arrange
      const source = [
        "await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);",
        "await page.getByRole('checkbox').setChecked(true);",
        "const value = await page.getByLabel('Save A:').inputValue();"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a scenario asserts against a reference screenshot', () => {
    it('should report the visual matchers and the capture that feeds them', () => {
      // Arrange
      const source = [
        'await expect(page).toHaveScreenshot();',
        'await expect(page).toMatchSnapshot();',
        "await page.screenshot({path: 'merge.png'});"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([
        {line: 1, reason: REFERENCE_SCREENSHOT_REASON},
        {line: 2, reason: REFERENCE_SCREENSHOT_REASON},
        {line: 3, reason: REFERENCE_SCREENSHOT_REASON}
      ]);
    });
  });

  describe('When a scenario designates the busy indicator by the label the hydration fallback shares', () => {
    it('should report the line, that label naming two states at once', () => {
      // Arrange
      const source = "await expect(page.getByText('Loading...')).toBeVisible();";

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([{line: 1, reason: AMBIGUOUS_BUSY_LABEL_REASON}]);
    });
  });

  describe('When a scenario designates the busy indicator by its role', () => {
    it('should report nothing, the role being what tells the indicator from the hydration fallback', () => {
      // Arrange
      const source = "await expect(page.getByRole('status')).toBeVisible();";

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a scenario designates elements by what the screen shows', () => {
    it('should report nothing for a role, a label or a sentence', () => {
      // Arrange
      const source = [
        "await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);",
        "await page.getByRole('button', {name: 'Merge'}).click();",
        "await expect(page.getByText('Merge successful!')).toBeVisible();"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When the shape of a refused call is quoted inside a string', () => {
    it('should report nothing, a quoted call not being code', () => {
      // Arrange
      const source = "const refusedForm = 'page.locator(\".merge-result\") designates nothing the screen shows';";

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a refused call is split from its own parenthesis by a line break', () => {
    it('should report nothing, the accepted limit of a line reading being that it never joins two lines', () => {
      // Arrange
      const source = [
        'await expect(page.getByTestId',
        "  ('merge-button')).toBeVisible();"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });
});
