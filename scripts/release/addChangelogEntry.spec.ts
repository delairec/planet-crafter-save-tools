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
