import {SaveValidationResult} from "./SaveValidationResult";

export interface SaveValidatorPort {
  hasJsonExtension(fileName: string): boolean;

  validate(content: string): SaveValidationResult;
}
