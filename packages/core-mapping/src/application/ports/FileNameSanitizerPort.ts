import {FileNamePartsResponse} from "../responses/FileNamePartsResponse";
import {SanitizedFileNameResponse} from "../responses/SanitizedFileNameResponse";

export interface FileNameSanitizerPort {
  sanitize(fileNameParts: FileNamePartsResponse): SanitizedFileNameResponse;
}
