import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort";
import {SaveSectionsPort} from "../application/ports/SaveSectionsPort";
import {FakeSaveSectionsService} from "./FakeSaveSectionsService";

export const SAVE_CONTENT = 'save content';

interface SaveSectionsReaderStubOptions {
  readonly saveSections?: SaveSectionsPort;
  readonly unreadableLines?: SaveParseError[];
}

export function stubSaveSectionsReader({
  saveSections = new FakeSaveSectionsService(),
  unreadableLines = []
}: SaveSectionsReaderStubOptions = {}): SaveSectionsReaderPort {
  return {
    read: (content: string) => {
      if (content !== SAVE_CONTENT) {
        throw new Error(`The reader stub reads only "${SAVE_CONTENT}", not "${content}"`);
      }
      return {saveSections, unreadableLines};
    }
  };
}
