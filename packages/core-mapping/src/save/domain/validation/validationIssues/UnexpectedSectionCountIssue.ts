export interface UnexpectedSectionCountIssue {
  readonly code: 'unexpected-section-count';
  readonly foundSectionCount: number;
  readonly expectedSectionCounts: number[];
}
