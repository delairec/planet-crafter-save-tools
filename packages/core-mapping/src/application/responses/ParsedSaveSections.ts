import {UnreadableLine} from "../ports/SaveSectionLocation";
import {SaveSections} from "../../domain/save/SaveSections";

export interface ParsedSaveSections {
  readonly sections: SaveSections;
  readonly errors: UnreadableLine[];
}
