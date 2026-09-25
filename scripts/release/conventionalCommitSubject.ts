const BREAKING_CHANGE_SUBJECT = /^\w+(\([^)]*\))?!:/;
const FEATURE_SUBJECT = /^feat(\([^)]*\))?:/;
const FEATURE_OR_FIX_SUBJECT = /^(feat|fix)(\([^)]*\))?:/;

export function isBreakingChange(subject: string): boolean {
  return BREAKING_CHANGE_SUBJECT.test(subject);
}

export function isFeature(subject: string): boolean {
  return FEATURE_SUBJECT.test(subject);
}

export function isUserFacingChange(subject: string): boolean {
  return FEATURE_OR_FIX_SUBJECT.test(subject) || isBreakingChange(subject);
}
