import {UnreadableLine} from "../ports/SaveSectionLocation";
import {SaveSectionsMapperPort} from "../ports/SaveSectionsMapperPort";

export interface SaveSectionsReadingResponse {
  readonly saveSections: SaveSectionsMapperPort;
  readonly unreadableLines: UnreadableLine[];
}
