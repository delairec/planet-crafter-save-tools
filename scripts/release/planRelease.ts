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

const BREAKING_CHANGE_SUBJECT = /^\w+(\([^)]*\))?!:/;
const FEATURE_SUBJECT = /^feat(\([^)]*\))?:/;

function determineIncrement(commitSubjects: string[]): VersionIncrement {
  if (commitSubjects.some((subject) => BREAKING_CHANGE_SUBJECT.test(subject))) {
    return 'major';
  }
  if (commitSubjects.some((subject) => FEATURE_SUBJECT.test(subject))) {
    return 'minor';
  }
  return 'patch';
}

function raiseVersion(version: string, increment: VersionIncrement): string {
  const [major = 0, minor = 0, patch = 0] = version.split('.').map(Number);
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
      version: raiseVersion(history.version, determineIncrement(history.commitSubjects)),
      commitSubjects: history.commitSubjects
    }));
}
