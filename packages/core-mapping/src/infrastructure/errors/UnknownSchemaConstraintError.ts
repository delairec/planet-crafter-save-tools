export class UnknownSchemaConstraintError extends Error {
  constructor(keyword: string) {
    super(`Unexpected schema error: the section validators reported the "${keyword}" constraint, which no validation issue states.`);
    this.name = 'UnknownSchemaConstraintError';
  }
}
