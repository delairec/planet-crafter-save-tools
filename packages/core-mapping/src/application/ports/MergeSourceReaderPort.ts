import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveSections} from "../../domain/rules/merge/SaveSections";

export interface MergeSource {
  readonly sections: SaveSections;
  readonly errors: SaveParseError[];
}

export interface MergeSourceReaderPort {
  read(content: string): MergeSource;
}
