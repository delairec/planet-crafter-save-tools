import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {createReleaseRepository, type ReleaseRepository} from './testing/createReleaseRepository.ts';

const CLI_MERGE_MANIFEST = JSON.stringify({name: 'cli-merge', version: '0.1.0', dependencies: {'core-mapping': 'workspace:*'}}, null, 2);
const CORE_MAPPING_MANIFEST = JSON.stringify({name: 'core-mapping', version: '0.0.0', changelogLine: 'Core engine updated'}, null, 2);
const CORE_MAPPING_MANIFEST_WITHOUT_CHANGELOG_LINE = JSON.stringify({name: 'core-mapping', version: '0.0.0'}, null, 2);

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
      expect(await repository.readFile('packages/cli-merge/CHANGELOG.md')).toContain('- Core engine updated');
    });

    it('should print the title of the release pull request', () => {
      // Act
      const run = repository.runScript('release.ts');

      // Assert
      expect(run.stdout).toContain('Open the release pull request against master: chore(release): cli-merge 0.1.1');
    });
  });

  describe('When a dependency declaring no changelog line brought a fix', () => {
    beforeEach(async () => {
      await repository.commitFile('packages/core-mapping/package.json', CORE_MAPPING_MANIFEST_WITHOUT_CHANGELOG_LINE, 'chore(core-mapping): drop its changelog line');
      await repository.commitFile('packages/core-mapping/index.ts', 'export {};\n', 'fix(core-mapping): refuse an empty section (#182)');
    });

    it('should refuse the release, naming that dependency', () => {
      // Act
      const run = repository.runScript('release.ts');

      // Assert
      expect(run.stderr).toContain('core-mapping brings a feature or a fix but declares no changelogLine in its package.json');
    });

    it('should leave the manifest of the consumer untouched', async () => {
      // Act
      repository.runScript('release.ts');

      // Assert
      expect(await repository.readFile('packages/cli-merge/package.json')).toContain('"version": "0.1.0"');
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
