import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {createReleaseRepository, type ReleaseRepository} from './testing/createReleaseRepository.ts';

const CLI_MERGE_MANIFEST = JSON.stringify({name: 'cli-merge', version: '0.1.0', dependencies: {'core-mapping': 'workspace:*'}}, null, 2);
const CORE_MAPPING_MANIFEST = JSON.stringify({name: 'core-mapping', version: '0.0.0'}, null, 2);

describe('release', () => {
  let repository: ReleaseRepository;

  beforeEach(async () => {
    repository = await createReleaseRepository();
    await repository.commitFile('packages/core-mapping/package.json', CORE_MAPPING_MANIFEST, 'feat(core-mapping): read the saves');
    await repository.commitFile('packages/cli-merge/package.json', CLI_MERGE_MANIFEST, 'chore(release): cli-merge 0.1.0 (#180)');
    repository.runGit(['tag', 'cli-merge-v0.1.0']);
  });

  afterEach(async () => {
    await repository.remove();
  });

  describe('When a package a consumer depends on changed since its last version', () => {
    beforeEach(async () => {
      await repository.commitFile('packages/core-mapping/index.ts', 'export {};\n', 'fix(core-mapping): refuse an empty section (#182)');
    });

    it('should write the next version into the manifest of the consumer', async () => {
      // Act
      repository.runScript('release.ts');

      // Assert
      expect(await repository.readFile('packages/cli-merge/package.json')).toContain('"version": "0.1.1"');
    });

    it('should write the changelog of the consumer', async () => {
      // Act
      repository.runScript('release.ts');

      // Assert
      expect(await repository.readFile('packages/cli-merge/CHANGELOG.md')).toContain('fix(core-mapping): refuse an empty section (#182)');
    });

    it('should print the title of the release pull request', () => {
      // Act
      const run = repository.runScript('release.ts');

      // Assert
      expect(run.stdout).toContain('Open the release pull request against master: chore(release): cli-merge 0.1.1');
    });
  });

  describe('When no consumer changed since its last version', () => {
    it('should say that no consumer is released', () => {
      // Act
      const run = repository.runScript('release.ts');

      // Assert
      expect(run.stdout).toBe('No consumer changed since its last version.\n');
    });
  });
});
