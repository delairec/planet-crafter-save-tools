import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {LoadAndValidateSaveFilePresenterPort} from "./ports/LoadAndValidateSaveFilePresenterPort";
import {LoadAndValidateSaveFileRequest} from "./requests/LoadAndValidateSaveFileRequest";
import {validateUniqueHost} from "../domain/rules/validateUniqueHost";

export class LoadAndValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: LoadAndValidateSaveFilePresenterPort
  ) {
  }

  async execute({fileName, content}: LoadAndValidateSaveFileRequest): Promise<void> {
    const validation = this.validator.validate(fileName, content);

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

    this.presenter.presentLoadedSaveFile(validation.warnings);
  }
}
