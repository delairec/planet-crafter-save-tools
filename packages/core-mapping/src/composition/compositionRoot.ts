import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveSectionsParserService} from "../infrastructure/SaveSectionsParserService";
import {SaveSectionsSerializerService} from "../infrastructure/SaveSectionsSerializerService";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";
import {SaveSectionsSerializerPort} from "../application/ports/SaveSectionsSerializerPort";

export function createSaveValidator(): SaveValidatorPort {
  return new SaveValidatorService();
}

export function createSaveSectionsParser(): SaveSectionsParserPort {
  return new SaveSectionsParserService();
}

export function createSaveSectionsSerializer(): SaveSectionsSerializerPort {
  return new SaveSectionsSerializerService();
}
