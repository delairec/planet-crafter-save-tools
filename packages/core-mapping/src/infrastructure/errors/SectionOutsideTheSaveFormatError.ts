export class SectionOutsideTheSaveFormatError extends Error {
  constructor(sectionIndex: number, formatRelease: string) {
    super(`Unexpected save data: the format of ${formatRelease} holds no section ${sectionIndex}.`);
    this.name = 'SectionOutsideTheSaveFormatError';
  }
}
