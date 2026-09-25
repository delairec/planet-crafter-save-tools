import {defineConfig, devices} from '@playwright/test';

const previewUrl = 'http://localhost:4173';

const isContinuousIntegration = !!process.env.CI;
const buildAndPreviewTimeout = 180_000;

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  globalSetup: '../../scripts/generate-scenario-fixtures.ts',
  forbidOnly: isContinuousIntegration,
  retries: isContinuousIntegration ? 1 : 0,
  reporter: isContinuousIntegration ? [['list'], ['html', {open: 'never'}]] : [['list']],
  use: {
    baseURL: previewUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'firefox', use: {...devices['Desktop Firefox']}},
    {name: 'webkit', use: {...devices['Desktop Safari']}}
  ],
  webServer: {
    command: 'bun run preview',
    url: previewUrl,
    reuseExistingServer: !isContinuousIntegration,
    timeout: buildAndPreviewTimeout
  }
});
