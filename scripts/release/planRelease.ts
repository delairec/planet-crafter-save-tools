import {isBreakingChange, isFeature} from './conventionalCommitSubject.ts';

export interface ConsumerHistory {
  name: string;
  version: string;
  commitSubjects: string[];
}

export interface PlannedRelease {
  name: string;
  version: string;
  commitSubjects: string[];
}

type VersionIncrement = 'major' | 'minor' | 'patch';

function determineIncrement(commitSubjects: string[]): VersionIncrement {
  if (commitSubjects.some(isBreakingChange)) {
    return 'major';
  }
  if (commitSubjects.some(isFeature)) {
    return 'minor';
  }
  return 'patch';
}

function lowerIncrementBeforeFirstMajor(increment: VersionIncrement): VersionIncrement {
  if (increment === 'major') {
    return 'minor';
  }
  return 'patch';
}

function raiseVersion(version: string, commitSubjects: string[]): string {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
  const commitsIncrement = determineIncrement(commitSubjects);
  const increment = major === 0 ? lowerIncrementBeforeFirstMajor(commitsIncrement) : commitsIncrement;
  if (increment === 'major') {
    return `${major + 1}.0.0`;
  }
  if (increment === 'minor') {
    return `${major}.${minor + 1}.0`;
  }
  return `${major}.${minor}.${patch + 1}`;
}

export function planRelease(histories: ConsumerHistory[]): PlannedRelease[] {
  return histories
    .filter((history) => history.commitSubjects.length > 0)
    .map((history) => ({
      name: history.name,
      version: raiseVersion(history.version, history.commitSubjects),
      commitSubjects: history.commitSubjects
    }));
}
