import {SaveSections} from "../../domain/save/SaveSections";

export interface SaveSectionsSerializerPort {
  serialize(sections: SaveSections): string;
}
