import type {PlannedRelease} from './planRelease.ts';

export interface ChangelogUpdate {
  changelog: string | undefined;
  release: PlannedRelease;
  date: string;
}

function renderHeader(name: string): string {
  return `# Changelog of ${name}\n\n`;
}

function renderEntry(release: PlannedRelease, date: string): string {
  const commitLines = release.commitSubjects.map((subject) => `- ${subject}\n`).join('');
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
