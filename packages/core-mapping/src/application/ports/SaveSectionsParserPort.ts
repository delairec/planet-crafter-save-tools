import {ParsedSaveSections} from "./ParsedSaveSections";

export interface SaveSectionsParserPort {
  parse(content: string): ParsedSaveSections;
}
