export interface CommitsQuery {
  repositoryRoot: string;
  sinceTag: string | undefined;
  paths: string[];
}

export interface ReleaseCommit {
  subject: string;
  changedFiles: string[];
}

const COMMIT_SEPARATOR = '\u001e';

function parseCommit(commitText: string): ReleaseCommit {
  const [subject = '', ...changedFiles] = commitText.split('\n').filter((line) => line !== '');
  return {subject, changedFiles};
}

export function readCommits(query: CommitsQuery): ReleaseCommit[] {
  const revisionRange = query.sinceTag === undefined ? [] : [`${query.sinceTag}..HEAD`];
  const gitLog = Bun.spawnSync(
    ['git', 'log', '--first-parent', '--name-only', `--format=${COMMIT_SEPARATOR}%s`, ...revisionRange, '--', ...query.paths],
    {cwd: query.repositoryRoot}
  );
  if (gitLog.exitCode !== 0) {
    throw new Error(gitLog.stderr.toString());
  }
  return gitLog.stdout
    .toString()
    .split(COMMIT_SEPARATOR)
    .filter((commitText) => commitText.trim() !== '')
    .map(parseCommit);
}
