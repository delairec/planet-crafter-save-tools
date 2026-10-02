export class NoGlobalMetadataToMergeError extends Error {
  constructor() {
    super('Neither save carries global metadata: validation should have refused them before the merge.');
    this.name = 'NoGlobalMetadataToMergeError';
  }
}
