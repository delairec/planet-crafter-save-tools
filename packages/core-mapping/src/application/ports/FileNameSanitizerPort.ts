import {FileNameParts} from "../responses/FileNameParts";
import {SanitizedFileName} from "../responses/SanitizedFileName";

export interface FileNameSanitizerPort {
  sanitize(fileNameParts: FileNameParts): SanitizedFileName;
}
