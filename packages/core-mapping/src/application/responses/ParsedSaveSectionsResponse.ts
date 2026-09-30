import {UnreadableLine} from "../ports/SaveSectionLocation";
import {SaveSections} from "../../domain/save/SaveSections";

export interface ParsedSaveSectionsResponse {
  readonly sections: SaveSections;
  readonly errors: UnreadableLine[];
}
