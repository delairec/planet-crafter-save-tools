import {describe, expect, it} from 'bun:test';
import {createPlatform} from './platform.js';
import * as platformCommon from './platform.common.js';
import * as bunPlatform from './platform.bun.js';
import * as nodePlatform from './platform.node.js';

describe('createPlatform', () => {

  describe('When called with "node"', () => {
    it('should expose the node file access over the common process and path access', () => {
      // Act
      const platform = createPlatform('node');

      // Assert
      expect(platform).toEqual({
        readTextFile: nodePlatform.readTextFile,
        writeTextFile: nodePlatform.writeTextFile,
        isEntryPoint: nodePlatform.isEntryPoint,
        readDirectory: platformCommon.readDirectory,
        joinPath: platformCommon.joinPath,
        getBasename: platformCommon.getBasename,
        exitProcess: platformCommon.exitProcess,
        getCliArguments: platformCommon.getCliArguments
      });
    });
  });

  describe('When called with "bun"', () => {
    it('should expose the bun file access over the common process and path access', () => {
      // Act
      const platform = createPlatform('bun');

      // Assert
      expect(platform).toEqual({
        readTextFile: bunPlatform.readTextFile,
        writeTextFile: bunPlatform.writeTextFile,
        isEntryPoint: bunPlatform.isEntryPoint,
        readDirectory: platformCommon.readDirectory,
        joinPath: platformCommon.joinPath,
        getBasename: platformCommon.getBasename,
        exitProcess: platformCommon.exitProcess,
        getCliArguments: platformCommon.getCliArguments
      });
    });
  });

  describe('When called with an unsupported platform name', () => {
    it('should throw an error listing the supported platforms', () => {
      // Act
      // @ts-expect-error 'deno' is not a supported platform: rejecting it is the behaviour under test.
      const execute = () => createPlatform('deno');

      // Assert
      expect(execute).toThrow('Unsupported platform: deno. Supported platforms: bun, node.');
    });
  });
});
