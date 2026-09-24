import type {VersionDocument} from '../versionDocument.ts';

export interface ServedVersionReport {
  siteUrl: string;
  servedVersion: VersionDocument | undefined;
  latestReleaseTag: string | undefined;
}

interface ReleaseTag {
  name: string;
  versionNumbers: number[];
}

const releaseTagPrefix = 'ui-save-manager-v';

const releaseTagReferencePattern = /\trefs\/tags\/(ui-save-manager-v(\d+)\.(\d+)\.(\d+))$/;

function parseReleaseTag(listingLine: string): ReleaseTag[] {
  const match = releaseTagReferencePattern.exec(listingLine);
  if (match === null) {
    return [];
  }
  const [, name = '', ...versionParts] = match;

  return [{name, versionNumbers: versionParts.map(Number)}];
}

function compareReleaseTags(first: ReleaseTag, second: ReleaseTag): number {
  for (const [index, versionNumber] of first.versionNumbers.entries()) {
    const difference = versionNumber - (second.versionNumbers[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}

export function findLatestReleaseTag(remoteTagListing: string): string | undefined {
  const releaseTags = remoteTagListing.split('\n').flatMap(parseReleaseTag);

  return releaseTags.toSorted(compareReleaseTags).at(-1)?.name;
}

function describeServedDocument(siteUrl: string, servedVersion: VersionDocument | undefined): string {
  if (servedVersion === undefined) {
    return `${siteUrl} serves no version.json: the version it serves is unknown.`;
  }
  const commitDescription = servedVersion.commit === null ? 'an unknown commit' : `commit ${servedVersion.commit}`;

  return `${siteUrl} serves version ${servedVersion.version}, built from ${commitDescription}.`;
}

export function describeServedVersion(report: ServedVersionReport): string[] {
  const {siteUrl, servedVersion, latestReleaseTag} = report;
  const servedDocumentLine = describeServedDocument(siteUrl, servedVersion);
  if (latestReleaseTag === undefined || latestReleaseTag === `${releaseTagPrefix}${servedVersion?.version}`) {
    return [servedDocumentLine];
  }

  return [
    servedDocumentLine,
    `The latest release tag, ${latestReleaseTag}, is not the version ${siteUrl} serves.`
  ];
}
