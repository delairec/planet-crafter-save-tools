import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {SaveFileValidationPresenterPort} from "./ports/SaveFileValidationPresenterPort";
import {ValidateSaveFileRequest} from "./requests/ValidateSaveFileRequest";
import {validateUniqueHost} from "../domain/rules/validateUniqueHost";

export class ValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: SaveFileValidationPresenterPort
  ) {
  }

  async execute({fileName, content}: ValidateSaveFileRequest): Promise<void> {
    if (!this.validator.hasJsonExtension(fileName)) {
      this.presenter.presentFileWithoutJsonExtension();
      return;
    }

    const validation = this.validator.validate(content);

    if (!validation.isValid) {
      this.presenter.presentInvalidSaveFile(validation.errors, validation.warnings);
      return;
    }

    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.presentSaveFileWithUnreadableLines(unreadableLines, validation.warnings);
      return;
    }

    const uniqueHostViolation = validateUniqueHost(saveSections.getPlayers());

    if (uniqueHostViolation !== null) {
      this.presenter.presentSaveFileWithoutUniqueHost(uniqueHostViolation.hostCount, validation.warnings);
      return;
    }

    this.presenter.presentValidSaveFile(validation.warnings);
  }
}
