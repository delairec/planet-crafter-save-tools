import {describe, expect, it} from 'bun:test';
import {addChangelogEntry, type ChangelogDependency} from './addChangelogEntry.ts';

const CLI_MERGE_DEPENDENCIES: ChangelogDependency[] = [
  {name: 'core-mapping', directory: 'packages/core-mapping', changelogLine: 'Core engine updated'},
  {name: 'shared-platforms', directory: 'packages/shared-platforms', changelogLine: 'Runtime platform updated'},
  {name: 'util-types', directory: 'packages/util-types', changelogLine: 'Runtime platform updated'}
];

describe('addChangelogEntry', () => {

  describe('When the consumer has no changelog yet', () => {
    it('should write one holding the entry of the release', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-merge',
        version: '1.1.0',
        directory: 'packages/cli-merge',
        commits: [
          {subject: 'feat(cli-merge): add Skeo (#112)', changedFiles: ['packages/cli-merge/cli.js']},
          {subject: 'fix(cli-merge): refuse an empty folder (#102)', changedFiles: ['packages/cli-merge/cli.js']}
        ],
        dependencies: CLI_MERGE_DEPENDENCIES
      };

      // Act
      const changelog = addChangelogEntry({changelog: noChangelog, release, date: '2026-09-24'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-merge',
        '',
        '## 1.1.0 — 2026-09-24',
        '',
        '- feat(cli-merge): add Skeo (#112)',
        '- fix(cli-merge): refuse an empty folder (#102)',
        ''
      ].join('\n'));
    });
  });

  describe('When the release carries commits of other types beside features, fixes and breaking changes', () => {
    it('should list only the features, the fixes and the breaking changes, in the order of the release', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-merge',
        version: '1.2.0',
        directory: 'packages/cli-merge',
        commits: [
          {subject: 'chore(deps): bump typescript (#170)', changedFiles: ['packages/cli-merge/package.json']},
          {subject: 'feat: add support for Skeo moon update (#127)', changedFiles: ['packages/cli-merge/cli.js']},
          {subject: 'docs(tasks): archive a task (#171)', changedFiles: ['packages/cli-merge/README.md']},
          {subject: 'refactor(cli-merge)!: drop the legacy flag (#172)', changedFiles: ['packages/cli-merge/cli.js']},
          {subject: 'ci: pin the actions (#173)', changedFiles: ['packages/cli-merge/package.json']},
          {subject: 'fix(cli-merge): keep the output folder (#150)', changedFiles: ['packages/cli-merge/cli.js']},
          {subject: 'test(cli-merge): cover an empty folder (#174)', changedFiles: ['packages/cli-merge/cli.spec.js']},
          {subject: 'build: refresh the lockfile (#175)', changedFiles: ['packages/cli-merge/package.json']}
        ],
        dependencies: CLI_MERGE_DEPENDENCIES
      };

      // Act
      const changelog = addChangelogEntry({changelog: noChangelog, release, date: '2026-10-02'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-merge',
        '',
        '## 1.2.0 — 2026-10-02',
        '',
        '- feat: add support for Skeo moon update (#127)',
        '- refactor(cli-merge)!: drop the legacy flag (#172)',
        '- fix(cli-merge): keep the output folder (#150)',
        ''
      ].join('\n'));
    });
  });

  describe('When the release carries no feature, no fix and no breaking change', () => {
    it('should give the entry a single line saying it holds maintenance changes only', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-validate',
        version: '0.1.1',
        directory: 'packages/cli-validate',
        commits: [
          {subject: 'chore(deps): bump typescript (#170)', changedFiles: ['packages/core-mapping/package.json']},
          {subject: 'docs(tasks): archive a task (#171)', changedFiles: ['packages/cli-validate/README.md']}
        ],
        dependencies: CLI_MERGE_DEPENDENCIES
      };

      // Act
      const changelog = addChangelogEntry({changelog: noChangelog, release, date: '2026-10-02'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-validate',
        '',
        '## 0.1.1 — 2026-10-02',
        '',
        '- Maintenance changes only',
        ''
      ].join('\n'));
    });
  });

  describe('When the features and fixes of the release come only from a dependency', () => {
    it('should give the line of that dependency instead of its commits', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-validate',
        version: '0.1.1',
        directory: 'packages/cli-validate',
        commits: [
          {subject: 'feat(ui): display energy levels (#176)', changedFiles: ['packages/core-mapping/src/energy.ts', 'packages/ui-save-manager/src/Energy.tsx']},
          {subject: 'fix(core-mapping): refuse an empty section (#160)', changedFiles: ['packages/core-mapping/src/rules.ts']}
        ],
        dependencies: CLI_MERGE_DEPENDENCIES
      };

      // Act
      const changelog = addChangelogEntry({changelog: noChangelog, release, date: '2026-09-26'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-validate',
        '',
        '## 0.1.1 — 2026-09-26',
        '',
        '- Core engine updated',
        ''
      ].join('\n'));
    });
  });

  describe('When the release carries features of its own beside a fix of a dependency', () => {
    it('should list its own features, then the line of the dependency', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-merge',
        version: '0.1.1',
        directory: 'packages/cli-merge',
        commits: [
          {subject: 'fix(core-mapping): refuse an empty section (#160)', changedFiles: ['packages/core-mapping/src/rules.ts']},
          {subject: 'feat(cli-merge): report each folder as one block (#182)', changedFiles: ['packages/cli-merge/cli.js']}
        ],
        dependencies: CLI_MERGE_DEPENDENCIES
      };

      // Act
      const changelog = addChangelogEntry({changelog: noChangelog, release, date: '2026-09-26'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-merge',
        '',
        '## 0.1.1 — 2026-09-26',
        '',
        '- feat(cli-merge): report each folder as one block (#182)',
        '- Core engine updated',
        ''
      ].join('\n'));
    });
  });

  describe('When a commit scoped to another tool changes the directory of the consumer', () => {
    it('should list that commit', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-validate',
        version: '0.1.1',
        directory: 'packages/cli-validate',
        commits: [
          {subject: 'feat(cli-merge): print the same lines under Bun as under Node (#182)', changedFiles: ['packages/cli-merge/cli.js', 'packages/cli-validate/cli.js']}
        ],
        dependencies: CLI_MERGE_DEPENDENCIES
      };

      // Act
      const changelog = addChangelogEntry({changelog: noChangelog, release, date: '2026-09-26'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-validate',
        '',
        '## 0.1.1 — 2026-09-26',
        '',
        '- feat(cli-merge): print the same lines under Bun as under Node (#182)',
        ''
      ].join('\n'));
    });
  });

  describe('When two changed dependencies declare the same line', () => {
    it('should write that line once, after the line of the other dependency', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-merge',
        version: '0.1.2',
        directory: 'packages/cli-merge',
        commits: [
          {subject: 'fix(shared-platforms): read a path under Node (#190)', changedFiles: ['packages/shared-platforms/node.ts', 'packages/util-types/platform.ts']},
          {subject: 'feat(core-mapping): merge the drones (#191)', changedFiles: ['packages/core-mapping/src/drones.ts']}
        ],
        dependencies: CLI_MERGE_DEPENDENCIES
      };

      // Act
      const changelog = addChangelogEntry({changelog: noChangelog, release, date: '2026-10-02'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-merge',
        '',
        '## 0.1.2 — 2026-10-02',
        '',
        '- Core engine updated',
        '- Runtime platform updated',
        ''
      ].join('\n'));
    });
  });

  describe('When a dependency declaring no changelog line brings a feature', () => {
    it('should refuse, naming that dependency', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-merge',
        version: '0.1.2',
        directory: 'packages/cli-merge',
        commits: [
          {subject: 'feat(shared-cache): keep the last save (#192)', changedFiles: ['packages/cli-merge/cli.js', 'packages/shared-cache/cache.ts']}
        ],
        dependencies: [{name: 'shared-cache', directory: 'packages/shared-cache', changelogLine: undefined}]
      };

      // Act
      const adding = () => addChangelogEntry({changelog: noChangelog, release, date: '2026-10-02'});

      // Assert
      expect(adding).toThrow('shared-cache brings a feature or a fix but declares no changelogLine in its package.json');
    });
  });

  describe('When the consumer already has a changelog', () => {
    it('should put the entry of the release above the previous ones', () => {
      // Arrange
      const previousChangelog = [
        '# Changelog of cli-merge',
        '',
        '## 1.1.0 — 2026-09-24',
        '',
        '- feat(cli-merge): add Skeo (#112)',
        ''
      ].join('\n');
      const release = {
        name: 'cli-merge',
        version: '1.1.1',
        directory: 'packages/cli-merge',
        commits: [{subject: 'fix(cli-merge): keep the output folder (#150)', changedFiles: ['packages/cli-merge/cli.js']}],
        dependencies: CLI_MERGE_DEPENDENCIES
      };

      // Act
      const changelog = addChangelogEntry({changelog: previousChangelog, release, date: '2026-10-02'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-merge',
        '',
        '## 1.1.1 — 2026-10-02',
        '',
        '- fix(cli-merge): keep the output folder (#150)',
        '',
        '## 1.1.0 — 2026-09-24',
        '',
        '- feat(cli-merge): add Skeo (#112)',
        ''
      ].join('\n'));
    });
  });
});
