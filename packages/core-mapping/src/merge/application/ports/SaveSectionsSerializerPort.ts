import {SaveSections} from "../../../save/domain/save/SaveSections";

export interface SaveSectionsSerializerPort {
  serialize(sections: SaveSections): string;
}
