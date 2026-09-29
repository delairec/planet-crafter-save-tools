import {SaveParseError} from "shared-save-processing/gameDefinitions";
import {SaveSectionsReaderPort, SaveSectionsReading} from "../application/ports/SaveSectionsReaderPort";
import {SaveSectionsPort} from "../application/ports/SaveSectionsPort";
import {FakeSaveSectionsService} from "./FakeSaveSectionsService";

export const SAVE_CONTENT = 'save content';

const UNEXPECTED_CONTENT_LINE: SaveParseError = {detail: `The reader stub reads only "${SAVE_CONTENT}"`};

interface SaveSectionsReaderStubOptions {
  readonly saveSections?: SaveSectionsPort;
  readonly unreadableLines?: SaveParseError[];
}

export function stubSaveSectionsReader({
  saveSections = new FakeSaveSectionsService(),
  unreadableLines = []
}: SaveSectionsReaderStubOptions = {}): SaveSectionsReaderPort {
  return {
    read: (content: string): SaveSectionsReading => content === SAVE_CONTENT ? {saveSections, unreadableLines} : {saveSections, unreadableLines: [UNEXPECTED_CONTENT_LINE]}
  };
}
