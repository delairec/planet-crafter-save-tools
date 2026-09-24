import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {readCommitSubjects} from './readCommitSubjects.ts';

const CONSUMER_PATHS = ['packages/cli-merge', 'packages/core-mapping'];
const NO_TAG = undefined;

describe('readCommitSubjects', () => {
  let repositoryRoot: string;

  function runGit(gitArguments: string[]): void {
    Bun.spawnSync(['git', '-c', 'user.name=Salengor', '-c', 'user.email=salengor@example.com', ...gitArguments], {
      cwd: repositoryRoot
    });
  }

  async function commitFile(path: string, subject: string): Promise<void> {
    await mkdir(join(repositoryRoot, dirname(path)), {recursive: true});
    await writeFile(join(repositoryRoot, path), subject);
    runGit(['add', '--', path]);
    runGit(['commit', '--quiet', '-m', subject]);
  }

  beforeEach(async () => {
    repositoryRoot = await mkdtemp(join(tmpdir(), 'read-commit-subjects-'));
    runGit(['init', '--quiet', '--initial-branch=master']);
    await commitFile('README.md', 'docs: describe the tools');
    await commitFile('packages/core-mapping/index.ts', 'feat(core-mapping): add Skeo (#112)');
    await commitFile('packages/ui-save-manager/app.tsx', 'fix(ui-save-manager): restore colors (#121)');
    await commitFile('packages/cli-merge/cli.js', 'fix(cli-merge): keep the output folder (#150)');
  });

  afterEach(async () => {
    await rm(repositoryRoot, {recursive: true, force: true});
  });

  describe('When the consumer has no version tag yet', () => {
    it('should give every commit touching its paths, newest first', () => {
      // Act
      const subjects = readCommitSubjects({repositoryRoot, sinceTag: NO_TAG, paths: CONSUMER_PATHS});

      // Assert
      expect(subjects).toEqual(['fix(cli-merge): keep the output folder (#150)', 'feat(core-mapping): add Skeo (#112)']);
    });
  });

  describe('When the consumer has a version tag', () => {
    it('should give only the commits touching its paths made after that tag', async () => {
      // Arrange
      runGit(['tag', 'cli-merge-v1.0.0']);
      await commitFile('packages/core-mapping/rules.ts', 'fix(core-mapping): refuse an empty section (#160)');
      await commitFile('packages/ui-save-manager/footer.tsx', 'feat(ui-save-manager): show the version (#161)');

      // Act
      const subjects = readCommitSubjects({repositoryRoot, sinceTag: 'cli-merge-v1.0.0', paths: CONSUMER_PATHS});

      // Assert
      expect(subjects).toEqual(['fix(core-mapping): refuse an empty section (#160)']);
    });
  });

  describe('When a branch was merged into master', () => {
    it('should give the merge commit, not the commits of the branch', async () => {
      // Arrange
      runGit(['switch', '--quiet', '-c', 'integration/wave']);
      await commitFile('packages/core-mapping/wave.ts', 'feat(core-mapping): step one of the wave');
      runGit(['switch', '--quiet', 'master']);
      runGit(['merge', '--quiet', '--no-ff', '-m', 'feat(core-mapping): deliver the wave (#170)', 'integration/wave']);

      // Act
      const subjects = readCommitSubjects({repositoryRoot, sinceTag: NO_TAG, paths: CONSUMER_PATHS});

      // Assert
      expect(subjects).toEqual([
        'feat(core-mapping): deliver the wave (#170)',
        'fix(cli-merge): keep the output folder (#150)',
        'feat(core-mapping): add Skeo (#112)'
      ]);
    });
  });
});
