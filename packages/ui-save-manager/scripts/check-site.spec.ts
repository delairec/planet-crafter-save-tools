import {describe, expect, it} from 'bun:test';
import {fileURLToPath} from 'node:url';

const CHECK_SITE_PATH = fileURLToPath(new URL('./check-site.ts', import.meta.url));

function runCheckSite(urlArgument: string): {exitCode: number, stdout: string, stderr: string} {
  const result = Bun.spawnSync(['bun', CHECK_SITE_PATH, urlArgument], {stdout: 'pipe', stderr: 'pipe'});

  return {exitCode: result.exitCode, stdout: result.stdout.toString(), stderr: result.stderr.toString()};
}

describe('Site check run as a process', () => {

  describe('When the requested URL is neither the production site nor one of its deploy previews', () => {
    it('should refuse the URL before fetching anything and exit with 1', () => {
      // Arrange
      const foreignSiteArgument = '--url=https://example.com/';

      // Act
      const run = runCheckSite(foreignSiteArgument);

      // Assert
      expect(run).toEqual({
        exitCode: 1,
        stdout: '',
        stderr: 'https://example.com/ is refused: --url= accepts https://planet-crafter-save-manager.netlify.app/ or one of its deploy previews, https://deploy-preview-<number>--planet-crafter-save-manager.netlify.app/.\n'
      });
    });
  });
});
