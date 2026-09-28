import {expect, test} from './scenarioTest';
import {locateTheFixture, mergeAndRevealTheMessages, visualizeAndRevealTheMessages} from './scenarioSteps';

const legacySaveFixturePath = locateTheFixture('legacy-format_valid.json');
const currentFormatSaveFixturePath = locateTheFixture('baseline_valid.json');

const legacyFormatWarningFragment = 'written by version 1.618 of the game or earlier';
const legacyFormatWarningCode = 'legacy-save-format';

test.describe('Save warnings', () => {
  test.describe('When a save file raising a warning is visualized', () => {
    test('should give the reader a sentence rather than the code the warning travels as', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await visualizeAndRevealTheMessages(page, legacySaveFixturePath, 'display-warnings');

      // Assert
      await expect(page.getByTestId('display-warnings-title')).toHaveText('Warnings');
      await expect(page.getByTestId('display-warnings-messages')).toContainText(legacyFormatWarningFragment);
      await expect(page.getByTestId('display-warnings-messages')).not.toContainText(legacyFormatWarningCode);
    });

    test('should render the save data all the same, a warning not making the save unusable', async ({page}) => {
      // Arrange
      await page.goto('/');
      await page.getByTestId('save-file').setInputFiles(legacySaveFixturePath);

      // Act
      await page.getByTestId('visualize').click();

      // Assert
      await expect(page.getByTestId('display-warnings-title')).toHaveText('Warnings');
      await expect(page.getByTestId('loaded-save-title')).toHaveText('Loaded save: legacy-format_valid.json');
    });
  });

  test.describe('When a save file raising a warning is merged with a save file raising none', () => {
    test('should attribute the warning to the input that raised it and still produce a file', async ({page}) => {
      // Arrange
      await page.goto('/');

      // Act
      await mergeAndRevealTheMessages(page, legacySaveFixturePath, currentFormatSaveFixturePath, 'save-a-warnings');

      // Assert
      await expect(page.getByTestId('save-a-warnings-title')).toHaveText('Save A warnings');
      await expect(page.getByTestId('save-b-warnings-title')).toBeHidden();
      await expect(page.getByTestId('save-a-warnings-messages')).toContainText(legacyFormatWarningFragment);
      await expect(page.getByTestId('merged-save-download')).toBeVisible();
    });
  });
});
