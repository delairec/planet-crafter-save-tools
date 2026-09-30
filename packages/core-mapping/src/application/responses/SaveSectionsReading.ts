import {UnreadableLine} from "../ports/SaveSectionLocation";
import {SaveSectionsMapperPort} from "../ports/SaveSectionsMapperPort";

export interface SaveSectionsReading {
  readonly saveSections: SaveSectionsMapperPort;
  readonly unreadableLines: UnreadableLine[];
}
