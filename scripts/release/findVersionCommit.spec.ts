import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {findVersionCommit} from './findVersionCommit.ts';

const MANIFEST_PATH = 'packages/cli-merge/package.json';

describe('findVersionCommit', () => {
  let repositoryRoot: string;

  function runGit(gitArguments: string[]): string {
    const result = Bun.spawnSync(['git', '-c', 'user.name=Salengor', '-c', 'user.email=salengor@example.com', ...gitArguments], {
      cwd: repositoryRoot
    });
    return result.stdout.toString().trim();
  }

  async function commitFile(path: string, content: string, subject: string): Promise<string> {
    await mkdir(join(repositoryRoot, dirname(path)), {recursive: true});
    await writeFile(join(repositoryRoot, path), content);
    runGit(['add', '--', path]);
    runGit(['commit', '--quiet', '-m', subject]);
    return runGit(['rev-parse', 'HEAD']);
  }

  function manifest(version: string, dependencies: string[]): string {
    return JSON.stringify({name: 'cli-merge', version, dependencies: Object.fromEntries(dependencies.map(name => [name, '*']))}, null, 2);
  }

  beforeEach(async () => {
    repositoryRoot = await mkdtemp(join(tmpdir(), 'find-version-commit-'));
    runGit(['init', '--quiet', '--initial-branch=master']);
    await commitFile(MANIFEST_PATH, manifest('0.0.0', ['core-mapping']), 'chore(release): version the consumers');
  });

  afterEach(async () => {
    await rm(repositoryRoot, {recursive: true, force: true});
  });

  describe('When commits landed on master after the release pull request', () => {
    it('should give the commit that wrote the version, not the tip of master', async () => {
      // Arrange
      const releaseCommit = await commitFile(MANIFEST_PATH, manifest('0.1.0', ['core-mapping']), 'chore(release): cli-merge 0.1.0 (#180)');
      await commitFile(MANIFEST_PATH, manifest('0.1.0', ['core-mapping', 'shared-platforms']), 'build(cli-merge): depend on shared-platforms (#181)');
      await commitFile('packages/core-mapping/index.ts', 'fix(core-mapping): refuse an empty section (#182)', 'fix(core-mapping): refuse an empty section (#182)');

      // Act
      const versionCommit = findVersionCommit({repositoryRoot, manifestPath: MANIFEST_PATH, version: '0.1.0'});

      // Assert
      expect(versionCommit).toBe(releaseCommit);
    });
  });

  describe('When no commit writes the version', () => {
    it('should refuse, naming the version and the manifest', () => {
      // Act
      const readVersionCommit = () => findVersionCommit({repositoryRoot, manifestPath: MANIFEST_PATH, version: '0.3.0'});

      // Assert
      expect(readVersionCommit).toThrow(`No first-parent commit writes version 0.3.0 into ${MANIFEST_PATH}.`);
    });
  });
});
