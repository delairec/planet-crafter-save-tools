import {ParsedSaveSectionsResponse} from "../responses/ParsedSaveSectionsResponse";

export interface SaveSectionsParserPort {
  parse(content: string): ParsedSaveSectionsResponse;
}
