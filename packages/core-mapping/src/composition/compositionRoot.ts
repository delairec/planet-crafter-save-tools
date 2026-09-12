import {SaveValidatorService} from "../infrastructure/SaveValidatorService";
import {MergeSourceReaderService} from "../infrastructure/MergeSourceReaderService";
import {MergedSaveSerializerService} from "../infrastructure/MergedSaveSerializerService";
import {SaveSectionsParserService} from "../infrastructure/SaveSectionsParserService";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {MergeSourceReaderPort} from "../application/ports/MergeSourceReaderPort";
import {MergedSaveSerializerPort} from "../application/ports/MergedSaveSerializerPort";
import {SaveSectionsParserPort} from "../application/ports/SaveSectionsParserPort";

export function createSaveValidator(): SaveValidatorPort {
  return new SaveValidatorService();
}

export function createMergeSourceReader(): MergeSourceReaderPort {
  return new MergeSourceReaderService();
}

export function createMergedSaveSerializer(): MergedSaveSerializerPort {
  return new MergedSaveSerializerService();
}

export function createSaveSectionsParser(): SaveSectionsParserPort {
  return new SaveSectionsParserService();
}
