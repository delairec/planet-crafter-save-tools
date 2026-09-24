import {describe, expect, it} from 'bun:test';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {join} from 'node:path';
import {text} from 'node:stream/consumers';
import {fileURLToPath} from 'node:url';
import {MERGE_CLI_HELP} from '../testing/mergeCliHelp.js';

const REPOSITORY_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const NODE_LOADER_PATH = join(REPOSITORY_ROOT, 'scripts/node/register.js');
const MERGE_CLI_PATH = join(REPOSITORY_ROOT, 'packages/cli-merge/cli/merge-cli.js');

/**
 * @param {string[]} command the interpreter and its arguments
 * @returns {Promise<{exitCode: number, stdout: string, stderr: string}>}
 */
async function runCommand([interpreter, ...interpreterArguments]) {
  const cliProcess = spawn(interpreter, interpreterArguments, {cwd: REPOSITORY_ROOT});
  const [stdout, stderr, [exitCode]] = await Promise.all([
    text(cliProcess.stdout),
    text(cliProcess.stderr),
    once(cliProcess, 'close')
  ]);

  return {exitCode, stdout, stderr};
}

describe('Merge CLI help', () => {
  describe('When the help is asked', () => {
    it.each([
      ['Bun', ['bun', MERGE_CLI_PATH, '--help']],
      ['Node', ['node', '--import', NODE_LOADER_PATH, MERGE_CLI_PATH, '--platform=node', '--help']]
    ])('should print the help on stdout and exit with code 0 under %s', async (_interpreterName, command) => {
      // Act
      const cliRun = await runCommand(command);

      // Assert
      expect(cliRun).toEqual({exitCode: 0, stdout: `${MERGE_CLI_HELP}\n`, stderr: ''});
    });
  });

  describe('When an argument names no flag the command accepts', () => {
    it.each([
      ['Bun', ['bun', MERGE_CLI_PATH, '--unknown']],
      ['Node', ['node', '--import', NODE_LOADER_PATH, MERGE_CLI_PATH, '--platform=node', '--unknown']]
    ])('should name it on stderr, followed by the help, and exit with code 1 under %s', async (_interpreterName, command) => {
      // Act
      const cliRun = await runCommand(command);

      // Assert
      expect(cliRun).toEqual({exitCode: 1, stdout: '', stderr: `✖ Unknown argument(s): --unknown\n${MERGE_CLI_HELP}\n`});
    });
  });
});
