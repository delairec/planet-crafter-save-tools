import {CURRENT_FORMAT_RELEASE, resolveGameRelease} from 'shared-save-processing/gameReleases.js';

export function resolveGameReleaseOfDeclaredVersion(declaredVersion: string | undefined): string {
  return (declaredVersion === undefined ? undefined : resolveGameRelease(declaredVersion)) ?? CURRENT_FORMAT_RELEASE;
}
