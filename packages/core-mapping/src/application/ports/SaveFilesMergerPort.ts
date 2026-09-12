/**
 * The file the merge produced: what the port hands back to the use case. Naming the file and
 * serializing its content both happen in infrastructure, but neither the name nor the content is
 * an infrastructure type, so the port declares the shape it returns itself.
 */
export interface MergedSaveFile {
  readonly fileName: string;
  readonly content: string;
}

export interface SaveFilesMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string, saveDisplayName?: string): MergedSaveFile;
}
