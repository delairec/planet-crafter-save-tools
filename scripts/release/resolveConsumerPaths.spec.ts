import {describe, expect, it} from 'bun:test';
import {type ConsumerPaths, resolveConsumerPaths, type WorkspaceManifest} from './resolveConsumerPaths.ts';

const NO_DEPENDENCIES: string[] = [];

describe('resolveConsumerPaths', () => {

  describe('When a consumer depends on a package that depends on another', () => {
    it('should give the directory of the consumer and of every package it reaches', () => {
      // Arrange
      const manifests: WorkspaceManifest[] = [
        {directory: 'packages/ui-save-manager', name: 'ui-save-manager', dependencies: ['core-mapping', 'solid-js']},
        {directory: 'packages/core-mapping', name: 'core-mapping', dependencies: ['ajv', 'shared-save-processing']},
        {directory: 'packages/shared-save-processing', name: 'shared-save-processing', dependencies: NO_DEPENDENCIES}
      ];

      // Act
      const consumers = resolveConsumerPaths(manifests);

      // Assert
      expect<ConsumerPaths[]>(consumers).toEqual([
        {
          name: 'ui-save-manager',
          directory: 'packages/ui-save-manager',
          paths: ['packages/core-mapping', 'packages/shared-save-processing', 'packages/ui-save-manager']
        }
      ]);
    });
  });

  describe('When the workspace holds a command package, a web package and libraries', () => {
    it('should give the command and the web package only', () => {
      // Arrange
      const manifests: WorkspaceManifest[] = [
        {directory: 'packages/cli-validate', name: 'cli-validate', dependencies: ['shared-platforms']},
        {directory: 'packages/shared-platforms', name: 'shared-platforms', dependencies: ['util-types']},
        {directory: 'packages/ui-save-manager', name: 'ui-save-manager', dependencies: NO_DEPENDENCIES},
        {directory: 'packages/util-types', name: 'util-types', dependencies: NO_DEPENDENCIES}
      ];

      // Act
      const consumers = resolveConsumerPaths(manifests);

      // Assert
      expect<ConsumerPaths[]>(consumers).toEqual([
        {
          name: 'cli-validate',
          directory: 'packages/cli-validate',
          paths: ['packages/cli-validate', 'packages/shared-platforms', 'packages/util-types']
        },
        {name: 'ui-save-manager', directory: 'packages/ui-save-manager', paths: ['packages/ui-save-manager']}
      ]);
    });
  });

  describe('When two dependencies of a consumer share a dependency', () => {
    it('should give that shared directory once', () => {
      // Arrange
      const manifests: WorkspaceManifest[] = [
        {directory: 'packages/cli-merge', name: 'cli-merge', dependencies: ['core-mapping', 'shared-save-processing']},
        {directory: 'packages/core-mapping', name: 'core-mapping', dependencies: ['shared-save-processing']},
        {directory: 'packages/shared-save-processing', name: 'shared-save-processing', dependencies: NO_DEPENDENCIES}
      ];

      // Act
      const consumers = resolveConsumerPaths(manifests);

      // Assert
      expect<ConsumerPaths[]>(consumers).toEqual([
        {
          name: 'cli-merge',
          directory: 'packages/cli-merge',
          paths: ['packages/cli-merge', 'packages/core-mapping', 'packages/shared-save-processing']
        }
      ]);
    });
  });
});
