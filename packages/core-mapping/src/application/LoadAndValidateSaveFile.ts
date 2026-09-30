import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {GameReleasesReaderPort} from "./ports/GameReleasesReaderPort";
import {LoadAndValidateSaveFilePresenterPort} from "./ports/LoadAndValidateSaveFilePresenterPort";
import {LoadAndValidateSaveFileRequest} from "./requests/LoadAndValidateSaveFileRequest";
import {SaveValidationResult} from "./ports/SaveValidationResult";
import {validateUniqueHost} from "../domain/rules/validateUniqueHost";
import {detectDeclaredReleaseContradiction} from "../domain/rules/detectDeclaredReleaseContradiction";

export class LoadAndValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly gameReleasesReader: GameReleasesReaderPort,
    private readonly presenter: LoadAndValidateSaveFilePresenterPort
  ) {
  }

  async execute({fileName, content}: LoadAndValidateSaveFileRequest): Promise<void> {
    if (!this.validator.hasJsonExtension(fileName)) {
      this.presenter.presentFileWithoutJsonExtension();
      return;
    }

    const validation = this.validator.validate(content);
    const contradiction = detectDeclaredReleaseContradiction(validation, this.gameReleasesReader.readGameReleases());
    const warnings: SaveValidationResult['warnings'] = contradiction === null ? validation.warnings : [...validation.warnings, {code: 'declared-release-contradicts-content', ...contradiction}];

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

    this.presenter.presentLoadedSaveFile(warnings);
  }
}
