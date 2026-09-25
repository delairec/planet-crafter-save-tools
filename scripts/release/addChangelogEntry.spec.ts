import {describe, expect, it} from 'bun:test';
import {addChangelogEntry} from './addChangelogEntry.ts';

describe('addChangelogEntry', () => {

  describe('When the consumer has no changelog yet', () => {
    it('should write one holding the entry of the release', () => {
      // Arrange
      const noChangelog = undefined;
      const release = {
        name: 'cli-merge',
        version: '1.1.0',
        commitSubjects: ['feat(core-mapping): add Skeo (#112)', 'fix(core-mapping): refuse an empty section (#102)']
      };

      // Act
      const changelog = addChangelogEntry({changelog: noChangelog, release, date: '2026-09-24'});

      // Assert
      expect(changelog).toBe([
        '# Changelog of cli-merge',
        '',
        '## 1.1.0 — 2026-09-24',
        '',
        '- feat(core-mapping): add Skeo (#112)',
        '- fix(core-mapping): refuse an empty section (#102)',
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
        commitSubjects: [
          'chore(deps): bump typescript (#170)',
          'feat: add support for Skeo moon update (#127)',
          'docs(tasks): archive a task (#171)',
          'refactor(core-mapping)!: drop the legacy reader (#172)',
          'ci: pin the actions (#173)',
          'fix(cli-merge): keep the output folder (#150)',
          'test(core-mapping): cover an empty section (#174)',
          'build: refresh the lockfile (#175)'
        ]
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
        '- refactor(core-mapping)!: drop the legacy reader (#172)',
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
        commitSubjects: ['chore(deps): bump typescript (#170)', 'docs(tasks): archive a task (#171)']
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

  describe('When the consumer already has a changelog', () => {
    it('should put the entry of the release above the previous ones', () => {
      // Arrange
      const previousChangelog = [
        '# Changelog of cli-merge',
        '',
        '## 1.1.0 — 2026-09-24',
        '',
        '- feat(core-mapping): add Skeo (#112)',
        ''
      ].join('\n');
      const release = {name: 'cli-merge', version: '1.1.1', commitSubjects: ['fix(cli-merge): keep the output folder (#150)']};

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
        '- feat(core-mapping): add Skeo (#112)',
        ''
      ].join('\n'));
    });
  });
});
