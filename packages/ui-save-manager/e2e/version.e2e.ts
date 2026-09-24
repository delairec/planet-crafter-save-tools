import {expect, test} from '@playwright/test';
import uiManifest from '../package.json' with {type: 'json'};

test.describe('Application version', () => {
  test.describe('When the home page is opened', () => {
    test('should display the version of the web application in the footer', async ({page}) => {
      // Act
      await page.goto('/');

      // Assert
      await expect(page.getByRole('contentinfo')).toHaveText(`Version ${uiManifest.version}`);
    });
  });
});
