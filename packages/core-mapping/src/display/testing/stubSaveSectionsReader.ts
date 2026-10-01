import {UnreadableLine} from "../../save/domain/save/SaveSectionLocation";
import {SaveSectionsReaderPort} from "../application/ports/SaveSectionsReaderPort";
import {SaveSectionsReadingResponse} from "../application/responses/SaveSectionsReadingResponse";
import {SaveSectionsMapperPort} from "../application/ports/SaveSectionsMapperPort";
import {FakeSaveSectionsMapperService} from "./FakeSaveSectionsMapperService";
import {GLOBAL_METADATA_SECTION} from "../../save/testing/saveSectionLocations";

export const SAVE_CONTENT = 'save content';

const UNEXPECTED_CONTENT_LINE: UnreadableLine = {
  code: 'invalid-json',
  section: GLOBAL_METADATA_SECTION,
  entryIndex: 0,
  line: `The reader stub reads only "${SAVE_CONTENT}"`
};

interface SaveSectionsReaderStubOptions {
  readonly saveSections?: SaveSectionsMapperPort;
  readonly unreadableLines?: UnreadableLine[];
}

export function stubSaveSectionsReader({
  saveSections = new FakeSaveSectionsMapperService(),
  unreadableLines = []
}: SaveSectionsReaderStubOptions = {}): SaveSectionsReaderPort {
  return {
    read: (content: string): SaveSectionsReadingResponse => content === SAVE_CONTENT ? {saveSections, unreadableLines} : {saveSections, unreadableLines: [UNEXPECTED_CONTENT_LINE]}
  };
}
