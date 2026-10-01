import {UnreadableLine} from "../../../save/domain/save/SaveSectionLocation";
import {SaveSectionsMapperPort} from "../ports/SaveSectionsMapperPort";

export interface SaveSectionsReadingResponse {
  readonly saveSections: SaveSectionsMapperPort;
  readonly unreadableLines: UnreadableLine[];
}
