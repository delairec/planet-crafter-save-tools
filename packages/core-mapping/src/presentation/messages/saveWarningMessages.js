export const legacySaveFormatWarningMessage = 'This save was written by version 1.618 of the game or earlier, in the format that still carries the Terrain Layers section.';
export const unknownSaveWarningMessage = 'This save raised a warning the save manager cannot describe.';

/**
 * @param {{declaredVersion: string, declaredRelease: string, carriedRelease: string}} contradiction
 * @returns {string}
 */
export function formatDeclaredReleaseContradictsContentWarningMessage({declaredVersion, declaredRelease, carriedRelease}) {
  return `This save declares game version ${declaredVersion}, which the format of release ${declaredRelease} writes, but carries the format of release ${carriedRelease}. It was read by what it carries.`;
}
