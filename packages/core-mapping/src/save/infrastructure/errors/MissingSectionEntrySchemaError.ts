export class MissingSectionEntrySchemaError extends Error {
  constructor(sectionIndex: number, formatRelease: string | undefined) {
    super(`Unexpected save data: no schema describes the entries of section ${sectionIndex} in the format of ${formatRelease}.`);
    this.name = 'MissingSectionEntrySchemaError';
  }
}
