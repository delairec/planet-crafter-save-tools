import {describe, expect, it} from 'bun:test';
import {describeServedVersion, findLatestReleaseTag, type ServedVersionReport} from './servedVersion.ts';

const productionSiteUrl = 'https://planet-crafter-save-manager.netlify.app/';

function createReport(changes: Partial<ServedVersionReport>): ServedVersionReport {
  return {
    siteUrl: productionSiteUrl,
    servedVersion: {version: '0.3.0', commit: '5a31590c4e2f'},
    latestReleaseTag: 'ui-save-manager-v0.3.0',
    ...changes
  };
}

describe('findLatestReleaseTag', () => {

  describe('When the remote carries several release tags', () => {
    it('should name the tag of the highest version, compared number by number', () => {
      // Arrange
      const remoteTagListing = [
        '1f44e72d\trefs/tags/ui-save-manager-v0.9.4',
        'eafc7003\trefs/tags/ui-save-manager-v0.10.0',
        '66452e4b\trefs/tags/ui-save-manager-v0.2.11',
        ''
      ].join('\n');

      // Act
      const latestReleaseTag = findLatestReleaseTag(remoteTagListing);

      // Assert
      expect(latestReleaseTag).toBe('ui-save-manager-v0.10.0');
    });
  });

  describe('When the listing names the tag of the highest version twice', () => {
    it('should name that tag, two equal versions ranking alike', () => {
      // Arrange
      const remoteTagListing = [
        'eafc7003\trefs/tags/ui-save-manager-v0.10.0',
        '1f44e72d\trefs/tags/ui-save-manager-v0.9.4',
        'eafc7003\trefs/tags/ui-save-manager-v0.10.0'
      ].join('\n');

      // Act
      const latestReleaseTag = findLatestReleaseTag(remoteTagListing);

      // Assert
      expect(latestReleaseTag).toBe('ui-save-manager-v0.10.0');
    });
  });

  describe('When the remote carries no release tag', () => {
    it('should name no tag', () => {
      // Arrange
      const emptyRemoteTagListing = '';

      // Act
      const latestReleaseTag = findLatestReleaseTag(emptyRemoteTagListing);

      // Assert
      expect(latestReleaseTag).toBeUndefined();
    });
  });
});

describe('describeServedVersion', () => {

  describe('When the site serves the version of the latest release tag', () => {
    it('should print the version and the commit it serves alone', () => {
      // Arrange
      const report = createReport({});

      // Act
      const lines = describeServedVersion(report);

      // Assert
      expect(lines).toEqual([
        'https://planet-crafter-save-manager.netlify.app/ serves version 0.3.0, built from commit 5a31590c4e2f.'
      ]);
    });
  });

  describe('When the site was built without a commit reference', () => {
    it('should print that the commit it serves is unknown', () => {
      // Arrange
      const report = createReport({servedVersion: {version: '0.3.0', commit: null}});

      // Act
      const lines = describeServedVersion(report);

      // Assert
      expect(lines).toEqual([
        'https://planet-crafter-save-manager.netlify.app/ serves version 0.3.0, built from an unknown commit.'
      ]);
    });
  });

  describe('When the site serves a version older than the latest release tag', () => {
    it('should name the latest release tag the site does not serve', () => {
      // Arrange
      const report = createReport({latestReleaseTag: 'ui-save-manager-v0.4.0'});

      // Act
      const lines = describeServedVersion(report);

      // Assert
      expect(lines).toEqual([
        'https://planet-crafter-save-manager.netlify.app/ serves version 0.3.0, built from commit 5a31590c4e2f.',
        'The latest release tag, ui-save-manager-v0.4.0, is not the version https://planet-crafter-save-manager.netlify.app/ serves.'
      ]);
    });
  });

  describe('When the site serves no version file', () => {
    it('should print that the version it serves is unknown and name the latest release tag', () => {
      // Arrange
      const noServedVersion = undefined;
      const report = createReport({servedVersion: noServedVersion});

      // Act
      const lines = describeServedVersion(report);

      // Assert
      expect(lines).toEqual([
        'https://planet-crafter-save-manager.netlify.app/ serves no version.json: the version it serves is unknown.',
        'The latest release tag, ui-save-manager-v0.3.0, is not the version https://planet-crafter-save-manager.netlify.app/ serves.'
      ]);
    });
  });

  describe('When no release tag exists yet', () => {
    it('should print the version and the commit the site serves alone', () => {
      // Arrange
      const noReleaseTag = undefined;
      const report = createReport({latestReleaseTag: noReleaseTag});

      // Act
      const lines = describeServedVersion(report);

      // Assert
      expect(lines).toEqual([
        'https://planet-crafter-save-manager.netlify.app/ serves version 0.3.0, built from commit 5a31590c4e2f.'
      ]);
    });
  });
});
