export class UnexpectedSaveSectionError extends Error {
  constructor(sectionIndex: number, section: unknown) {
    super(`Unexpected save data: section ${sectionIndex} should hold a list of entries, received ${String(section)}.`);
    this.name = 'UnexpectedSaveSectionError';
  }
}
