import {SaveSectionsReading} from "../responses/SaveSectionsReading";

export interface SaveSectionsReaderPort {
  read(content: string): SaveSectionsReading;
}
