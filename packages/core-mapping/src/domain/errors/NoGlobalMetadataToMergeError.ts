/**
 * The merge reached global metadata with neither save carrying any: validation should have
 * refused both saves before the merge started. Getting here means the invariant is broken rather
 * than the saves being malformed, so the merge stops instead of falling back to a default
 * metadata. Fix what let the saves through; never soften the guard.
 */
export class NoGlobalMetadataToMergeError extends Error {
  constructor() {
    super('Neither save carries global metadata (section 0): validation should have refused them before the merge.');
    this.name = 'NoGlobalMetadataToMergeError';
  }
}
