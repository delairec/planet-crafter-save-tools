import {SaveSectionsReadingResponse} from "../responses/SaveSectionsReadingResponse";

export interface SaveSectionsReaderPort {
  read(content: string): SaveSectionsReadingResponse;
}
