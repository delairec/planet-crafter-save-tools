import {SaveValidationResponse} from "../responses/SaveValidationResponse";

export interface SaveValidatorPort {
  hasJsonExtension(fileName: string): boolean;

  validate(content: string): SaveValidationResponse;
}
