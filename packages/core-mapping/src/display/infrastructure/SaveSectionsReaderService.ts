import {SaveSectionsReaderPort} from '../application/ports/SaveSectionsReaderPort';
import {SaveSectionsReadingResponse} from '../application/responses/SaveSectionsReadingResponse';
import {SaveSectionsParserPort} from '../../save/application/ports/SaveSectionsParserPort';
import {SaveSectionsMapperService} from './SaveSectionsMapperService';

export class SaveSectionsReaderService implements SaveSectionsReaderPort {

  constructor(private readonly parser: SaveSectionsParserPort) {
  }

  read(content: string): SaveSectionsReadingResponse {
    const {sections, errors} = this.parser.parse(content);

    return {saveSections: new SaveSectionsMapperService(sections), unreadableLines: errors};
  }
}
