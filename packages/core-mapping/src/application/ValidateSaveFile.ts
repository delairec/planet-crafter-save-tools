import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {GameReleasesReaderPort} from "./ports/GameReleasesReaderPort";
import {SaveFileValidationPresenterPort} from "./ports/SaveFileValidationPresenterPort";
import {ValidateSaveFileRequest} from "./requests/ValidateSaveFileRequest";
import {collectSaveWarnings} from "./collectSaveWarnings";
import {validateUniqueHost} from "../domain/rules/validateUniqueHost";

export class ValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly gameReleasesReader: GameReleasesReaderPort,
    private readonly presenter: SaveFileValidationPresenterPort
  ) {
  }

  async execute({fileName, content}: ValidateSaveFileRequest): Promise<void> {
    if (!this.validator.hasJsonExtension(fileName)) {
      this.presenter.presentFileWithoutJsonExtension();
      return;
    }

    const validation = this.validator.validate(content);
    const warnings = collectSaveWarnings(validation, this.gameReleasesReader.readGameReleases());

    if (!validation.isValid) {
      this.presenter.presentInvalidSaveFile(validation.errors, warnings);
      return;
    }

    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.presentSaveFileWithUnreadableLines(unreadableLines, warnings);
      return;
    }

    const uniqueHostViolation = validateUniqueHost(saveSections.getPlayers());

    if (uniqueHostViolation !== null) {
      this.presenter.presentSaveFileWithoutUniqueHost(uniqueHostViolation.hostCount, warnings);
      return;
    }

    this.presenter.presentValidSaveFile(warnings);
  }
}
