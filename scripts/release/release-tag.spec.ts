import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {createReleaseRepository, type ReleaseRepository} from './testing/createReleaseRepository.ts';

const CLI_MERGE_MANIFEST = JSON.stringify({name: 'cli-merge', version: '0.1.0', dependencies: {'core-mapping': 'workspace:*'}}, null, 2);
const CORE_MAPPING_MANIFEST = JSON.stringify({name: 'core-mapping', version: '0.0.0'}, null, 2);

describe('release:tag', () => {
  let repository: ReleaseRepository;

  beforeEach(async () => {
    repository = await createReleaseRepository();
    await repository.commitFile('packages/core-mapping/package.json', CORE_MAPPING_MANIFEST, 'feat(core-mapping): read the saves');
    await repository.commitFile('packages/cli-merge/package.json', CLI_MERGE_MANIFEST, 'chore(release): cli-merge 0.1.0 (#180)');
  });

  afterEach(async () => {
    await repository.remove();
  });

  describe('When a consumer declares a version no tag names yet', () => {
    it('should tag the commit that wrote that version', () => {
      // Arrange
      const versionCommit = repository.runGit(['rev-parse', 'HEAD']);

      // Act
      repository.runScript('release-tag.ts');

      // Assert
      expect(repository.runGit(['rev-list', '-n', '1', 'cli-merge-v0.1.0'])).toBe(versionCommit);
    });

    it('should print the command that pushes the tag', () => {
      // Act
      const run = repository.runScript('release-tag.ts');

      // Assert
      expect(run.stdout).toContain('Push the tags: git push origin cli-merge-v0.1.0');
    });
  });

  describe('When every declared version is already tagged', () => {
    it('should say so and tag nothing', () => {
      // Arrange
      repository.runGit(['tag', 'cli-merge-v0.1.0']);

      // Act
      const run = repository.runScript('release-tag.ts');

      // Assert
      expect(run.stdout).toBe('Every declared version is already tagged.\n');
    });
  });

  describe('When the current branch is not master', () => {
    it('should refuse to tag, naming the current branch', () => {
      // Arrange
      repository.runGit(['switch', '--quiet', '--create', 'chore/release']);

      // Act
      const run = repository.runScript('release-tag.ts');

      // Assert
      expect(run.stderr).toContain('A version is tagged on master once its release pull request is merged; the current branch is chore/release.');
    });
  });
});
