import {SaveSectionsReading} from "./SaveSectionsReading";

export interface SaveSectionsReaderPort {
  read(content: string): SaveSectionsReading;
}
