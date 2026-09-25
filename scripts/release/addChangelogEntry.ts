import {isUserFacingChange} from './conventionalCommitSubject.ts';
import type {PlannedRelease} from './planRelease.ts';

const MAINTENANCE_ONLY_LINE = '- Maintenance changes only\n';

export interface ChangelogUpdate {
  changelog: string | undefined;
  release: PlannedRelease;
  date: string;
}

function renderHeader(name: string): string {
  return `# Changelog of ${name}\n\n`;
}

function renderCommitLines(commitSubjects: string[]): string {
  const userFacingSubjects = commitSubjects.filter(isUserFacingChange);
  if (userFacingSubjects.length === 0) {
    return MAINTENANCE_ONLY_LINE;
  }
  return userFacingSubjects.map((subject) => `- ${subject}\n`).join('');
}

function renderEntry(release: PlannedRelease, date: string): string {
  const commitLines = renderCommitLines(release.commitSubjects);
  return `## ${release.version} — ${date}\n\n${commitLines}`;
}

export function addChangelogEntry(update: ChangelogUpdate): string {
  const header = renderHeader(update.release.name);
  const entry = renderEntry(update.release, update.date);
  if (update.changelog === undefined) {
    return `${header}${entry}`;
  }
  return `${header}${entry}\n${update.changelog.slice(header.length)}`;
}
