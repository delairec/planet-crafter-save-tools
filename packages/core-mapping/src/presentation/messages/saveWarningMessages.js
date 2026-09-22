export const legacySaveFormatWarningMessage = 'This save was created by an older version of the game and has been adapted to the current format. The obsolete Terrain Layers section was ignored.';
export const unknownSaveWarningMessage = 'This save had to be adapted to the current save format.';

/**
 * @param {{declaredVersion: string, declaredRelease: string, carriedRelease: string}} contradiction
 * @returns {string}
 */
export function formatDeclaredReleaseContradictsContentWarningMessage({declaredVersion, declaredRelease, carriedRelease}) {
  return `This save declares game version ${declaredVersion}, which the format of release ${declaredRelease} writes, but carries the format of release ${carriedRelease}. It was read by what it carries.`;
}
