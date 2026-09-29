import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveSectionsMapperPort} from "./SaveSectionsMapperPort";

export interface SaveSectionsReading {
  readonly saveSections: SaveSectionsMapperPort;
  readonly unreadableLines: SaveParseError[];
}

export interface SaveSectionsReaderPort {
  read(content: string): SaveSectionsReading;
}
