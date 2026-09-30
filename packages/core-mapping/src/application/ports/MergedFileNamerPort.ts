import {SourceFileNames} from "../responses/SourceFileNames";
import {MergedFileName} from "../responses/MergedFileName";

export interface MergedFileNamerPort {
  nameMergedFile(sourceFileNames: SourceFileNames): MergedFileName;
}
