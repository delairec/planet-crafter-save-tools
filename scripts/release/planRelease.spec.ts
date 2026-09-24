import {describe, expect, it} from 'bun:test';
import {type ConsumerHistory, planRelease, type PlannedRelease} from './planRelease.ts';

describe('planRelease', () => {

  describe('When a consumer carries a fix since its last version', () => {
    it('should raise its patch number', () => {
      // Arrange
      const histories: ConsumerHistory[] = [
        {name: 'cli-merge', version: '1.0.0', commitSubjects: ['fix(core-mapping): refuse an empty section (#102)']}
      ];

      // Act
      const releases = planRelease(histories);

      // Assert
      expect(releases).toEqual([
        {name: 'cli-merge', version: '1.0.1', commitSubjects: ['fix(core-mapping): refuse an empty section (#102)']}
      ]);
    });
  });

  describe('When a consumer carries a feature beside a fix', () => {
    it('should raise its minor number and reset its patch number', () => {
      // Arrange
      const histories: ConsumerHistory[] = [
        {
          name: 'ui-save-manager',
          version: '1.2.3',
          commitSubjects: ['feat(core-mapping): add Skeo (#112)', 'fix(ui-save-manager): restore colors (#121)']
        }
      ];

      // Act
      const releases = planRelease(histories);

      // Assert
      expect(releases).toEqual([
        {
          name: 'ui-save-manager',
          version: '1.3.0',
          commitSubjects: ['feat(core-mapping): add Skeo (#112)', 'fix(ui-save-manager): restore colors (#121)']
        }
      ]);
    });
  });

  describe('When a consumer carries a breaking change', () => {
    it('should raise its major number and reset the two others', () => {
      // Arrange
      const histories: ConsumerHistory[] = [
        {
          name: 'cli-validate',
          version: '1.2.3',
          commitSubjects: ['feat(cli-validate)!: rename the file flag (#140)', 'feat(core-mapping): add Skeo (#112)']
        }
      ];

      // Act
      const releases = planRelease(histories);

      // Assert
      expect(releases).toEqual([
        {
          name: 'cli-validate',
          version: '2.0.0',
          commitSubjects: ['feat(cli-validate)!: rename the file flag (#140)', 'feat(core-mapping): add Skeo (#112)']
        }
      ]);
    });
  });

  describe('When a consumer below its first major version carries a breaking change', () => {
    it('should raise its minor number and reset its patch number', () => {
      // Arrange
      const histories: ConsumerHistory[] = [
        {name: 'cli-validate', version: '0.3.2', commitSubjects: ['feat(cli-validate)!: rename the file flag (#140)']}
      ];

      // Act
      const releases = planRelease(histories);

      // Assert
      expect(releases).toEqual([
        {name: 'cli-validate', version: '0.4.0', commitSubjects: ['feat(cli-validate)!: rename the file flag (#140)']}
      ]);
    });
  });

  describe('When a consumer below its first major version carries a feature', () => {
    it('should raise its patch number', () => {
      // Arrange
      const histories: ConsumerHistory[] = [
        {name: 'ui-save-manager', version: '0.3.2', commitSubjects: ['feat(ui-save-manager): show the version (#151)']}
      ];

      // Act
      const releases = planRelease(histories);

      // Assert
      expect(releases).toEqual([
        {name: 'ui-save-manager', version: '0.3.3', commitSubjects: ['feat(ui-save-manager): show the version (#151)']}
      ]);
    });
  });

  describe('When a consumer carries no commit since its last version', () => {
    it('should plan no release for it', () => {
      // Arrange
      const noCommitSubjects: string[] = [];
      const histories: ConsumerHistory[] = [{name: 'cli-merge', version: '1.0.0', commitSubjects: noCommitSubjects}];

      // Act
      const releases = planRelease(histories);

      // Assert
      expect<PlannedRelease[]>(releases).toEqual([]);
    });
  });

  describe('When a commit subject does not follow Conventional Commits', () => {
    it('should raise the patch number', () => {
      // Arrange
      const histories: ConsumerHistory[] = [{name: 'cli-merge', version: '1.0.0', commitSubjects: ['add LICENSE']}];

      // Act
      const releases = planRelease(histories);

      // Assert
      expect(releases).toEqual([{name: 'cli-merge', version: '1.0.1', commitSubjects: ['add LICENSE']}]);
    });
  });

  describe('When several consumers carry different changes', () => {
    it('should raise each one by its own commits', () => {
      // Arrange
      const noCommitSubjects: string[] = [];
      const histories: ConsumerHistory[] = [
        {name: 'cli-merge', version: '1.0.0', commitSubjects: ['fix(cli-merge): keep the output folder (#150)']},
        {name: 'cli-validate', version: '1.0.0', commitSubjects: noCommitSubjects},
        {name: 'ui-save-manager', version: '1.0.0', commitSubjects: ['feat(ui-save-manager): show the version (#151)']}
      ];

      // Act
      const releases = planRelease(histories);

      // Assert
      expect(releases).toEqual([
        {name: 'cli-merge', version: '1.0.1', commitSubjects: ['fix(cli-merge): keep the output folder (#150)']},
        {name: 'ui-save-manager', version: '1.1.0', commitSubjects: ['feat(ui-save-manager): show the version (#151)']}
      ]);
    });
  });
});
