import {expect, test, type Page} from '@playwright/test';
import {readSiteHeaders} from '../siteHeaders';
import {removeScriptNonces} from '../src/lib/scriptNonce';

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
  await page.getByLabel('Save file:').setInputFiles(saveAFixturePath);
  await page.getByRole('button', {name: 'Visualize'}).click();
  await expect(page.getByRole('heading', {name: 'Save Configuration: Merged Save (Standard)'})).toBeVisible();
  await page.getByLabel('Save A:').setInputFiles(saveAFixturePath);
  await page.getByLabel('Save B:').setInputFiles(saveBFixturePath);
  await page.getByRole('button', {name: 'Merge'}).click();
  await expect(page.getByText('Merge successful!')).toBeVisible();
  const downloadStarted = page.waitForEvent('download');
  await page.getByRole('link', {name: 'Download'}).click();
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
