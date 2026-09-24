export interface CommitSubjectsQuery {
  repositoryRoot: string;
  sinceTag: string | undefined;
  paths: string[];
}

export function readCommitSubjects(query: CommitSubjectsQuery): string[] {
  const revisionRange = query.sinceTag === undefined ? [] : [`${query.sinceTag}..HEAD`];
  const gitLog = Bun.spawnSync(['git', 'log', '--first-parent', '--format=%s', ...revisionRange, '--', ...query.paths], {
    cwd: query.repositoryRoot
  });
  if (gitLog.exitCode !== 0) {
    throw new Error(gitLog.stderr.toString());
  }
  return gitLog.stdout
    .toString()
    .split('\n')
    .filter((subject) => subject !== '');
}
