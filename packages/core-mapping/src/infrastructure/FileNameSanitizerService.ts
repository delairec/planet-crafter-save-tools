import {stripJsonExtension} from "shared-save-processing/jsonExtension.js";
import {FileNameSanitizerPort} from "../application/ports/FileNameSanitizerPort";
import {FileNamePartsResponse} from "../application/responses/FileNamePartsResponse";
import {SanitizedFileNameResponse} from "../application/responses/SanitizedFileNameResponse";

export class FileNameSanitizerService implements FileNameSanitizerPort {
  sanitize({sourceFileNames, suffix}: FileNamePartsResponse): SanitizedFileNameResponse {
    const stem = `${sourceFileNames.map((fileName) => sanitizeFileName(stripJsonExtension(fileName))).join('-')}${suffix}`;

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
