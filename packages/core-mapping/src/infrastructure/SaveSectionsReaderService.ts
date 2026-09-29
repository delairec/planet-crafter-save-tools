import {SaveSectionsReaderPort, SaveSectionsReading} from '../application/ports/SaveSectionsReaderPort';
import {SaveSectionsParserPort} from '../application/ports/SaveSectionsParserPort';
import {SaveSectionsService} from './SaveSectionsService';

export class SaveSectionsReaderService implements SaveSectionsReaderPort {

  constructor(private readonly parser: SaveSectionsParserPort) {
  }

  read(content: string): SaveSectionsReading {
    const {sections, errors} = this.parser.parse(content);

    return {saveSections: new SaveSectionsService(sections), unreadableLines: errors};
  }
}
