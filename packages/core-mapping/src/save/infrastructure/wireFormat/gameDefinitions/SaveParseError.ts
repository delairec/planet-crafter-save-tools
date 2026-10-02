export type SaveParseError =
  | {code: 'unexpected-section-count'; foundSectionCount: number; expectedSectionCounts: number[]}
  | {code: 'unreadable-line'; sectionIndex: number; entryIndex: number; line: string};

export type SaveParseErrorCode = SaveParseError['code'];

export type UnreadableSaveLine = Extract<SaveParseError, {code: 'unreadable-line'}>;

export type UnexpectedSectionCount = Extract<SaveParseError, {code: 'unexpected-section-count'}>;
