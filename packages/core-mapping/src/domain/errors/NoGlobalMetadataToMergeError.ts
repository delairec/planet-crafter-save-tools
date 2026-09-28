export class NoGlobalMetadataToMergeError extends Error {
  constructor() {
    super('Neither save carries global metadata (section 0): validation should have refused them before the merge.');
    this.name = 'NoGlobalMetadataToMergeError';
  }
}
