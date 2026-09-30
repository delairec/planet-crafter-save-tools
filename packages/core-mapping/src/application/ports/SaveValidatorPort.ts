import {SaveValidationResult} from "../responses/SaveValidationResult";

export interface SaveValidatorPort {
  hasJsonExtension(fileName: string): boolean;

  validate(content: string): SaveValidationResult;
}
