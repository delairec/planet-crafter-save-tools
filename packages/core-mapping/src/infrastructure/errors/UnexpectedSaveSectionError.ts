/**
 * A section reached schema validation in a shape it never takes: the save reader hands every
 * section holding a schema over as a list of entries, but the world objects one, which is walked
 * entry by entry. Getting here means the invariant is broken rather than the save being malformed,
 * so the validation stops instead of reading the section as one without a single entry — which is
 * how the world objects section went unvalidated for as long as it did. Fix what handed the
 * section over; never soften the guard.
 */
export class UnexpectedSaveSectionError extends Error {
  constructor(sectionIndex: number, section: unknown) {
    super(`Unexpected save data: section ${sectionIndex} should hold a list of entries, received ${String(section)}.`);
    this.name = 'UnexpectedSaveSectionError';
  }
}
