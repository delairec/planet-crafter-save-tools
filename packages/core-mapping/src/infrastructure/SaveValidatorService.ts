import {hasJsonExtension} from "shared-save-processing/jsonExtension.js";
import {validateSaveContent} from "./validateSaveContent.js";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveValidationResult} from "../application/ports/SaveValidationResult";

export class SaveValidatorService implements SaveValidatorPort {
  hasJsonExtension(fileName: string): boolean {
    return hasJsonExtension(fileName);
  }

  validate(content: string): SaveValidationResult {
    const {isValid, errors, warnings, declaredVersion, carriedRelease} = validateSaveContent(content);

    return {isValid, errors, warnings, declaredVersion, carriedRelease};
  }
}
