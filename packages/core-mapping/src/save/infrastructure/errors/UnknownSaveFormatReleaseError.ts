export class UnknownSaveFormatReleaseError extends Error {
  constructor(formatRelease: string | undefined) {
    super(`Unexpected save data: no game release ${formatRelease} writes a known save format.`);
    this.name = 'UnknownSaveFormatReleaseError';
  }
}
