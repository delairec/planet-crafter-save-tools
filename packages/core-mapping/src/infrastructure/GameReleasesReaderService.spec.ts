import {describe, expect, it} from 'bun:test';
import {GameReleasesReaderService} from './GameReleasesReaderService';

describe('GameReleasesReaderService', () => {
  it('should read the game releases in release order, the first writing the format of twelve parts', () => {
    // Act
    const gameReleases = new GameReleasesReaderService().readGameReleases();

    // Assert
    expect(gameReleases[0]).toEqual({release: '1.618', splitPartsCount: 12});
  });
});
