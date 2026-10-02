import {describe, expect, it} from 'bun:test';
import {createFakeScriptIo} from '../../common/testing/createFakeScriptIo.ts';
import {readWorkspacePackageNames} from './readWorkspacePackageNames.ts';

describe('readWorkspacePackageNames', () => {

  describe('When the workspace holds several packages', () => {
    it('should read the name each workspace package declares, the manifest of a dependency left out', async () => {
      // Arrange
      const {io} = createFakeScriptIo({
        files: {
          'packages/core-mapping/package.json': '{"name": "core-mapping"}',
          'packages/shared-save-processing/package.json': '{"name": "shared-save-processing"}',
          'packages/core-mapping/node_modules/left-pad/package.json': '{"name": "left-pad"}'
        }
      });

      // Act
      const names = await readWorkspacePackageNames(io);

      // Assert
      expect(names).toEqual(new Set(['core-mapping', 'shared-save-processing']));
    });
  });
});
