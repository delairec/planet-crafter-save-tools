import {expect, test, type Page} from '@playwright/test';
import {readSiteHeaders} from '../siteHeaders';
import {removeScriptNonces} from '../src/lib/scriptNonce';
import {visualizeSave} from "./helpers/visualizeSave";

const saveAFixturePath = new URL('./fixtures/baseline_valid.json', import.meta.url).pathname;
const saveBFixturePath = new URL('./fixtures/other-player_valid.json', import.meta.url).pathname;

/** The headers the server must send on the document, as `public/_headers` declares them. */
const policyHeaderNames = ['Content-Security-Policy', 'Referrer-Policy', 'Permissions-Policy'];

declare global {
  interface Window {
    reportedPolicyViolations: string[];
  }
}

async function recordPolicyViolations(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.reportedPolicyViolations = [];
    document.addEventListener('securitypolicyviolation', (violation) => {
      window.reportedPolicyViolations.push(`${violation.violatedDirective} ${violation.blockedURI}`);
    });
  });
}

function recordRequestedUrls(page: Page): string[] {
  const requestedUrls: string[] = [];
  page.on('request', (request) => requestedUrls.push(request.url()));

  return requestedUrls;
}

async function loadViewAndMergeASave(page: Page): Promise<void> {
  await page.goto('/');
  await visualizeSave(page, saveAFixturePath);
  await expect(page.getByTestId('save-configuration-title')).toHaveText('Save Configuration: Merged Save (Standard)');
  await page.getByTestId('save-a-input').setInputFiles(saveAFixturePath);
  await page.getByTestId('save-b-input').setInputFiles(saveBFixturePath);
  await page.getByTestId('merge-button').click();
  await expect(page.getByTestId('merge-success-message')).toBeVisible();
  const downloadStarted = page.waitForEvent('download');
  await page.getByTestId('download-link').click();
  await downloadStarted;
}

test.describe('Site security', () => {
  test.describe('When the page is requested', () => {
    test('should send on the document the policy headers public/_headers declares, its script nonce aside', async ({page}) => {
      // Arrange
      const siteHeaders = readSiteHeaders();

      // Act
      const response = await page.goto('/');

      // Assert
      const documentHeaders = await response?.allHeaders();
      for (const headerName of policyHeaderNames) {
        expect(removeScriptNonces(documentHeaders?.[headerName.toLowerCase()] ?? ''), headerName).toBe(siteHeaders[headerName]);
      }
    });
  });

  test.describe('When a save is loaded, viewed and merged', () => {
    test('should send no request outside the origin of the page', async ({page}) => {
      // Arrange
      const requestedUrls = recordRequestedUrls(page);

      // Act
      await loadViewAndMergeASave(page);

      // Assert
      const pageOrigin = new URL(page.url()).origin;
      const foreignUrls = requestedUrls.filter((url) => !url.startsWith('data:') && new URL(url).origin !== pageOrigin);
      expect(foreignUrls).toEqual([]);
    });

    test('should meet no refusal of the content security policy', async ({page}) => {
      // Arrange
      await recordPolicyViolations(page);

      // Act
      await loadViewAndMergeASave(page);

      // Assert
      expect(await page.evaluate(() => window.reportedPolicyViolations)).toEqual([]);
    });
  });
});
