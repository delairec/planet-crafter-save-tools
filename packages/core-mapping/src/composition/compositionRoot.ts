import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {SaveReaderService} from "../infrastructure/SaveReaderService";
import {SaveSerializerService} from "../infrastructure/SaveSerializerService";
import {SaveSectionsParserService} from "../infrastructure/SaveSectionsParserService";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveReaderPort} from "../application/ports/SaveReaderPort";
import {SaveSerializerPort} from "../application/ports/SaveSerializerPort";
import {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";

export function createSaveValidator(): SaveValidatorPort {
  return new SaveValidatorService();
}

export function createSaveReader(): SaveReaderPort {
  return new SaveReaderService();
}

export function createSaveSerializer(): SaveSerializerPort {
  return new SaveSerializerService();
}

export function createSaveSectionsParser(): SaveSectionsParserPort {
  return new SaveSectionsParserService();
}
