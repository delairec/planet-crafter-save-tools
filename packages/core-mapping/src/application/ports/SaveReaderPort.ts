import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveSections} from "../../domain/save/SaveSections";

export interface ReadSaveSections {
  readonly sections: SaveSections;
  readonly errors: SaveParseError[];
}

export interface SaveReaderPort {
  read(content: string): ReadSaveSections;
}
