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

  test.describe('When the version file is requested at the site root of a build that names no commit', () => {
    test('should serve the version of the web application and a null commit', async ({request}) => {
      // Act
      const response = await request.get('/version.json');

      // Assert
      expect(await response.json()).toEqual({version: uiManifest.version, commit: null});
    });
  });
});
