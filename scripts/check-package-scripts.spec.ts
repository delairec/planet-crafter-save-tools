import {describe, expect, it} from 'bun:test';
import {checkPackageScripts, findPackageScriptViolations, type ManifestScripts} from './check-package-scripts.ts';
import {createFakeScriptIo} from './testing/createFakeScriptIo.ts';

describe('findPackageScriptViolations', () => {

  describe('When the root scripts run the entry points and the packages only test them', () => {
    it('should find none', () => {
      // Arrange
      const manifests: ManifestScripts[] = [
        {
          manifestPath: 'package.json',
          scripts: {merge: 'bun packages/cli-merge/cli/merge-cli.js', 'node:merge': 'node --import ./scripts/node/register.js packages/cli-merge/cli/merge-cli.js --platform=node'}
        },
        {manifestPath: 'packages/cli-merge/package.json', main: 'cli/merge-cli.js', scripts: {test: 'bun test', 'lint:types': 'tsc --noEmit'}}
      ];

      // Act
      const violations = findPackageScriptViolations(manifests);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a package script runs bun with --cwd', () => {
    it('should find that script', () => {
      // Arrange
      const manifests: ManifestScripts[] = [
        {manifestPath: 'packages/core-mapping/package.json', main: 'src/index.ts', scripts: {generate: 'bun --cwd ../.. scripts/generate.ts'}}
      ];

      // Act
      const violations = findPackageScriptViolations(manifests);

      // Assert
      expect(violations).toEqual(['packages/core-mapping/package.json scripts.generate runs bun with --cwd']);
    });
  });

  describe('When a script chains a command after one running bun with --cwd=', () => {
    it('should find that script', () => {
      // Arrange
      const manifests: ManifestScripts[] = [
        {manifestPath: 'package.json', scripts: {build: 'tsc --noEmit && bun --cwd=packages/ui-save-manager run build'}}
      ];

      // Act
      const violations = findPackageScriptViolations(manifests);

      // Assert
      expect(violations).toEqual(['package.json scripts.build runs bun with --cwd']);
    });
  });

  describe('When a cli- package script runs its own entry point', () => {
    it('should find that script, the root scripts being the only entry of the command', () => {
      // Arrange
      const manifests: ManifestScripts[] = [
        {
          manifestPath: 'packages/cli-validate/package.json',
          main: 'cli/validate-cli.js',
          scripts: {test: 'bun test', 'node:validate': 'node --import ../../scripts/node/register.js cli/validate-cli.js --platform=node'}
        }
      ];

      // Act
      const violations = findPackageScriptViolations(manifests);

      // Assert
      expect(violations).toEqual(['packages/cli-validate/package.json scripts.node:validate runs the entry point cli/validate-cli.js, which only the root scripts run']);
    });
  });

  describe('When a package outside the cli- prefix names its main file in a script', () => {
    it('should find none', () => {
      // Arrange
      const manifests: ManifestScripts[] = [
        {manifestPath: 'packages/core-mapping/package.json', main: 'src/index.ts', scripts: {'lint:types': 'tsc --noEmit src/index.ts'}}
      ];

      // Act
      const violations = findPackageScriptViolations(manifests);

      // Assert
      expect(violations).toEqual([]);
    });
  });
});

describe('checkPackageScripts', () => {

  describe('When the root manifest runs the entry points and every package script runs from its own directory', () => {
    it('should print that no script breaks the rules and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'package.json': '{"scripts": {"merge": "bun packages/cli-merge/cli/merge-cli.js"}}',
          'packages/cli-merge/package.json': '{"main": "cli/merge-cli.js", "scripts": {"test": "bun test"}}'
        }
      });

      // Act
      await checkPackageScripts(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:package-scripts: no script runs bun with --cwd, and no cli- package script runs its entry point.'],
        exitCodes: [0]
      });
    });
  });

  describe('When a cli- package script runs its own entry point', () => {
    it('should print the script and the entry point, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'package.json': '{"scripts": {"merge": "bun packages/cli-merge/cli/merge-cli.js"}}',
          'packages/cli-merge/package.json': '{"main": "cli/merge-cli.js", "scripts": {"merge": "bun cli/merge-cli.js"}}'
        }
      });

      // Act
      await checkPackageScripts(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'packages/cli-merge/package.json scripts.merge runs the entry point cli/merge-cli.js, which only the root scripts run',
          'check:package-scripts: 1 script(s) breaking the rules of the package scripts.'
        ],
        exitCodes: [1]
      });
    });
  });
});
