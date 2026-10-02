export interface MergeSaveFilesInput {
  fileNameA: string;
  contentA: string;
  fileNameB: string;
  contentB: string;
  saveDisplayName?: string;
  preferLegacyFormat?: boolean;
}
