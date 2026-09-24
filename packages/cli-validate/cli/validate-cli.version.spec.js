import {describe, expect, it} from 'bun:test';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {join} from 'node:path';
import {text} from 'node:stream/consumers';
import {fileURLToPath} from 'node:url';
import cliManifest from '../package.json' with {type: 'json'};

const REPOSITORY_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const NODE_LOADER_PATH = join(REPOSITORY_ROOT, 'scripts/node/register.js');
const VALIDATE_CLI_PATH = join(REPOSITORY_ROOT, 'packages/cli-validate/cli/validate-cli.js');

/**
 * @param {string[]} command the interpreter and its arguments
 * @returns {Promise<{exitCode: number, stdout: string}>}
 */
async function runCommand([interpreter, ...interpreterArguments]) {
  const cliProcess = spawn(interpreter, interpreterArguments, {cwd: REPOSITORY_ROOT});
  const [stdout, [exitCode]] = await Promise.all([text(cliProcess.stdout), once(cliProcess, 'close')]);

  return {exitCode, stdout};
}

describe('Validate CLI version', () => {
  describe('When the version is asked', () => {
    it.each([
      ['Bun', ['bun', VALIDATE_CLI_PATH, '--version']],
      ['Node', ['node', '--import', NODE_LOADER_PATH, VALIDATE_CLI_PATH, '--platform=node', '--version']]
    ])('should print the version of its package under %s', async (_interpreterName, command) => {
      // Act
      const {exitCode, stdout} = await runCommand(command);

      // Assert
      expect(stdout).toBe(`cli-validate ${cliManifest.version}\n`);
      expect(exitCode).toBe(0);
    });
  });
});
