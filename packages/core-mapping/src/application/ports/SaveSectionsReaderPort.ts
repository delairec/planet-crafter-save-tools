import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveSectionsPort} from "./SaveSectionsPort";

export interface SaveSectionsReading {
  readonly saveSections: SaveSectionsPort;
  readonly unreadableLines: SaveParseError[];
}

export interface SaveSectionsReaderPort {
  read(content: string): SaveSectionsReading;
}
