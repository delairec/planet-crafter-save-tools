import {hasJsonExtension} from "./wireFormat/jsonExtension.js";
import {validateSaveContent} from "./validateSaveContent.js";
import {SaveValidatorPort} from "../application/ports/SaveValidatorPort";
import {SaveValidationResponse} from "../application/responses/SaveValidationResponse";

export class SaveValidatorService implements SaveValidatorPort {
  hasJsonExtension(fileName: string): boolean {
    return hasJsonExtension(fileName);
  }

  validate(content: string): SaveValidationResponse {
    const {isValid, errors, warnings, declaredVersion, carriedRelease} = validateSaveContent(content);

    return {isValid, errors, warnings, declaredVersion, carriedRelease};
  }
}
