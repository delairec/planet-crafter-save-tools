import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';
import {checkScenarioLocators, findScenarioLocatorViolations, isScenarioFile} from './check-scenario-locators.ts';

const ACCESSIBILITY_LOCATOR_REASON = 'a scenario designates an element by its test id, never by its role, its label or its text';
const CSS_SELECTOR_REASON = 'a scenario designates an element by its test id, never by a CSS selector';
const REFERENCE_SCREENSHOT_REASON = 'a scenario asserts what the screen shows in words, never against a reference screenshot';

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

  describe('When a scenario designates elements by their test id', () => {
    it('should report nothing, whether the scenario acts on the element, asserts it or narrows it down', () => {
      // Arrange
      const source = [
        "await page.getByTestId('save-a-input').setInputFiles(saveAFixturePath);",
        "await page.getByTestId('merge-button').click();",
        "await expect(page.getByTestId('merge-success-message')).toHaveText('Merge successful!');",
        "await expect(page.getByTestId('merge-area').getByTestId('save-a-input')).toHaveValue('');"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a scenario designates an element by its role, its label or its text', () => {
    it('should report each locator that reads the accessibility tree or the text of the page', () => {
      // Arrange
      const source = [
        "await page.getByRole('button', {name: 'Merge'}).click();",
        "await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);",
        "await expect(page.getByText('Merge successful!')).toBeVisible();",
        "await page.getByPlaceholder('Search').fill('Skeo');",
        "await expect(page.getByAltText('Planet')).toBeVisible();",
        "await expect(page.getByTitle('Swap save A and save B')).toBeVisible();"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([
        {line: 1, reason: ACCESSIBILITY_LOCATOR_REASON},
        {line: 2, reason: ACCESSIBILITY_LOCATOR_REASON},
        {line: 3, reason: ACCESSIBILITY_LOCATOR_REASON},
        {line: 4, reason: ACCESSIBILITY_LOCATOR_REASON},
        {line: 5, reason: ACCESSIBILITY_LOCATOR_REASON},
        {line: 6, reason: ACCESSIBILITY_LOCATOR_REASON}
      ]);
    });

    it('should report the locator reached from another element as well', () => {
      // Arrange
      const source = "await expect(page.getByTestId('merge-area').getByRole('listitem')).toHaveCount(1);";

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([{line: 1, reason: ACCESSIBILITY_LOCATOR_REASON}]);
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
        "await page.frameLocator('#preview').getByTestId('merge-button').click();",
        "await page.getByTestId('preview-area').frameLocator('iframe.preview').getByTestId('merge-button').click();"
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
        "await page.getByTestId('save-a-input').setInputFiles(saveAFixturePath);",
        "await page.getByTestId('prefer-legacy-format').setChecked(true);",
        "const value = await page.getByTestId('save-a-input').inputValue();"
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

  describe('When the shape of a refused call is quoted inside a string', () => {
    it('should report nothing, a quoted call not being code', () => {
      // Arrange
      const source = "const refusedForm = 'page.getByRole(\"button\") designates an element by its role';";

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
        'await expect(page.getByRole',
        "  ('button')).toBeVisible();"
      ].join('\n');

      // Act
      const violations = findScenarioLocatorViolations(source);

      // Assert
      expect(violations).toEqual([]);
    });
  });
});

describe('checkScenarioLocators', () => {

  describe('When every scenario designates an element by its test id', () => {
    it('should print that nothing was found and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/ui-save-manager/e2e/merge.e2e.ts': "await expect(page.getByTestId('merge-button')).toBeVisible();"
        }
      });

      // Act
      await checkScenarioLocators(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:locators: no scenario designates an element by something other than its test id.'],
        exitCodes: [0]
      });
    });
  });

  describe('When a scenario designates an element by its role', () => {
    it('should print each offending line with its reason, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/ui-save-manager/e2e/merge.e2e.ts': "await expect(page.getByRole('button', {name: 'Merge'})).toBeVisible();"
        }
      });

      // Act
      await checkScenarioLocators(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'packages/ui-save-manager/e2e/merge.e2e.ts:1\n  a scenario designates an element by its test id, never by its role, its label or its text',
          'check:locators: 1 line(s) designating an element by something other than its test id.'
        ],
        exitCodes: [1]
      });
    });
  });
});
