import {SaveSections} from "../../domain/save/SaveSections";

export interface SaveSerializerPort {
  serialize(sections: SaveSections): string;
}
