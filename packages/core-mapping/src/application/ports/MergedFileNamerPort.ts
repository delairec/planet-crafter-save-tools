import {SourceFileNames} from "./SourceFileNames";
import {MergedFileName} from "./MergedFileName";

export interface MergedFileNamerPort {
  nameMergedFile(sourceFileNames: SourceFileNames): MergedFileName;
}
