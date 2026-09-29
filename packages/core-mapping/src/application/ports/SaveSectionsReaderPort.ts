import {UnreadableLine} from "./SaveSectionLocation";
import {SaveSectionsMapperPort} from "./SaveSectionsMapperPort";

export interface SaveSectionsReading {
  readonly saveSections: SaveSectionsMapperPort;
  readonly unreadableLines: UnreadableLine[];
}

export interface SaveSectionsReaderPort {
  read(content: string): SaveSectionsReading;
}
