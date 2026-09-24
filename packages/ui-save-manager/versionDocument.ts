export interface VersionDocument {
  version: string;
  commit: string | null;
}

export function writeVersionDocument(version: string, commitReference: string | undefined): string {
  const versionDocument: VersionDocument = {version, commit: commitReference ?? null};

  return JSON.stringify(versionDocument);
}
