import {isUserFacingChange} from './conventionalCommitSubject.ts';
import type {ReleaseCommit} from './readCommits.ts';

const MAINTENANCE_ONLY_LINE = 'Maintenance changes only';

export interface ChangelogDependency {
  name: string;
  directory: string;
  changelogLine: string | undefined;
}

export interface ReleasedConsumer {
  name: string;
  version: string;
  directory: string;
  commits: ReleaseCommit[];
  dependencies: ChangelogDependency[];
}

export interface ChangelogUpdate {
  changelog: string | undefined;
  release: ReleasedConsumer;
  date: string;
}

function renderHeader(name: string): string {
  return `# Changelog of ${name}\n\n`;
}

function changesDirectory(commit: ReleaseCommit, directory: string): boolean {
  return commit.changedFiles.some((changedFile) => changedFile.startsWith(`${directory}/`));
}

function readChangelogLine(dependency: ChangelogDependency): string {
  if (dependency.changelogLine === undefined) {
    throw new Error(`${dependency.name} brings a feature or a fix but declares no changelogLine in its package.json`);
  }
  return dependency.changelogLine;
}

function refuseDependenciesWithoutChangelogLine(dependencies: ChangelogDependency[]): void {
  for (const dependency of dependencies) {
    readChangelogLine(dependency);
  }
}

function listChangedDependencies(release: ReleasedConsumer, commits: ReleaseCommit[]): ChangelogDependency[] {
  return release.dependencies.filter((dependency) => commits.some((commit) => changesDirectory(commit, dependency.directory)));
}

function listDependencyLines(release: ReleasedConsumer, receivedCommits: ReleaseCommit[]): string[] {
  return [...new Set(listChangedDependencies(release, receivedCommits).map(readChangelogLine))];
}

function listEntryLines(release: ReleasedConsumer): string[] {
  const userFacingCommits = release.commits.filter((commit) => isUserFacingChange(commit.subject));
  refuseDependenciesWithoutChangelogLine(listChangedDependencies(release, userFacingCommits));
  const ownCommits = userFacingCommits.filter((commit) => changesDirectory(commit, release.directory));
  const receivedCommits = userFacingCommits.filter((commit) => !ownCommits.includes(commit));
  const entryLines = [...ownCommits.map((commit) => commit.subject), ...listDependencyLines(release, receivedCommits)];
  if (entryLines.length === 0) {
    return [MAINTENANCE_ONLY_LINE];
  }
  return entryLines;
}

function renderEntry(release: ReleasedConsumer, date: string): string {
  const entryLines = listEntryLines(release).map((line) => `- ${line}\n`).join('');
  return `## ${release.version} — ${date}\n\n${entryLines}`;
}

export function addChangelogEntry(update: ChangelogUpdate): string {
  const header = renderHeader(update.release.name);
  const entry = renderEntry(update.release, update.date);
  if (update.changelog === undefined) {
    return `${header}${entry}`;
  }
  return `${header}${entry}\n${update.changelog.slice(header.length)}`;
}
