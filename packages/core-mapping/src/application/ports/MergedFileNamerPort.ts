export interface SourceFileNames {
  readonly fileNameA: string;
  readonly fileNameB: string;
}

export interface MergedFileName {
  readonly fileName: string;
  readonly stem: string;
}

export interface MergedFileNamerPort {
  nameMergedFile(sourceFileNames: SourceFileNames): MergedFileName;
}
