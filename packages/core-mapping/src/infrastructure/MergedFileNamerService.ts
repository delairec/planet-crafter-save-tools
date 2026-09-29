import {stripJsonExtension} from "shared-save-processing/jsonExtension.js";
import {MergedFileName, MergedFileNamerPort, SourceFileNames} from "../application/ports/MergedFileNamerPort";

export class MergedFileNamerService implements MergedFileNamerPort {
  nameMergedFile({fileNameA, fileNameB}: SourceFileNames): MergedFileName {
    const stem = `${sanitizeFileName(stripJsonExtension(fileNameA))}-${sanitizeFileName(stripJsonExtension(fileNameB))}-merged`;

    return {fileName: `${stem}.json`, stem};
  }
}

function sanitizeFileName(fileName: string): string {
  const sanitized = fileName
      .normalize('NFKC')
      .replace(/[\x00-\x1f\x7f/\\]+/g, '_')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/^\.+/, '')
      .slice(0, 100);

  return sanitized || 'save';
}
