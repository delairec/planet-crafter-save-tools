import {ParsedSaveSections} from "../responses/ParsedSaveSections";

export interface SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections;
}
