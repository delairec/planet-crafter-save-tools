export interface VersionCommitQuery {
  repositoryRoot: string;
  manifestPath: string;
  version: string;
}

/**
 * The first-parent commit that wrote this version into the manifest, whatever was merged after it.
 */
export function findVersionCommit(query: VersionCommitQuery): string {
  const gitLog = Bun.spawnSync(
    ['git', 'log', '-1', '--first-parent', '--format=%H', `-S"version": "${query.version}"`, '--', query.manifestPath],
    {cwd: query.repositoryRoot}
  );
  if (gitLog.exitCode !== 0) {
    throw new Error(gitLog.stderr.toString());
  }
  const versionCommit = gitLog.stdout.toString().trim();

  if (versionCommit === '') {
    throw new Error(`No first-parent commit writes version ${query.version} into ${query.manifestPath}.`);
  }
  return versionCommit;
}
