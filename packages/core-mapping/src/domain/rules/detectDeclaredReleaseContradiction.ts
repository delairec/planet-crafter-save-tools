import {resolveDeclaredGameRelease} from './resolveDeclaredGameRelease';
import {GameReleaseValueObject} from '../valueObjects/GameReleaseValueObject';

export interface CarriedAndDeclaredReleases {
  readonly declaredVersion?: string | undefined;
  readonly carriedRelease?: string | undefined;
}

export interface DeclaredReleaseContradiction {
  readonly declaredVersion: string;
  readonly declaredRelease: string;
  readonly carriedRelease: string;
}

export function detectDeclaredReleaseContradiction(
  {declaredVersion, carriedRelease}: CarriedAndDeclaredReleases,
  gameReleases: readonly GameReleaseValueObject[]
): DeclaredReleaseContradiction | null {
  if (declaredVersion === undefined || carriedRelease === undefined) {
    return null;
  }

  const declaredRelease = resolveDeclaredGameRelease(declaredVersion, gameReleases);
  const carriedFormat = gameReleases.find(({release}) => release === carriedRelease);

  if (declaredRelease === undefined || carriedFormat === undefined || declaredRelease.splitPartsCount === carriedFormat.splitPartsCount) {
    return null;
  }

  return {declaredVersion, declaredRelease: declaredRelease.release, carriedRelease};
}
