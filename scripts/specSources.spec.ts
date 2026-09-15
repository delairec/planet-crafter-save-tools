import {describe, expect, it} from 'bun:test';
import {isOwnSourceFile} from './specSources.ts';

describe('isOwnSourceFile', () => {

  describe('When a source file lives outside the packages directory', () => {
    it('should be checked, wherever it is written in the repository', () => {
      // Act
      const checkedPaths = ['testIsolation.spec.ts', 'scripts/node/hooks.spec.js', 'packages/cli-merge/cli/merge-cli.spec.js']
        .filter(isOwnSourceFile);

      // Assert
      expect(checkedPaths).toEqual(['testIsolation.spec.ts', 'scripts/node/hooks.spec.js', 'packages/cli-merge/cli/merge-cli.spec.js']);
    });
  });

  describe('When a source file is a scenario rather than a spec', () => {
    it('should be checked too, the filter reading every file of ours', () => {
      // Act
      const checkedPaths = ['packages/ui-save-manager/e2e/merge.e2e.ts'].filter(isOwnSourceFile);

      // Assert
      expect(checkedPaths).toEqual(['packages/ui-save-manager/e2e/merge.e2e.ts']);
    });
  });

  describe('When a source file comes from a dependency or a build output', () => {
    it('should be left out, that file not being ours', () => {
      // Act
      const checkedPaths = ['node_modules/some-lib/index.spec.js', 'packages/ui-save-manager/dist/bundle.spec.js']
        .filter(isOwnSourceFile);

      // Assert
      expect(checkedPaths).toEqual([]);
    });
  });
});
