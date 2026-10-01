import {UseCase} from "../../save/application/UseCase";
import {SaveValidatorPort} from "../../save/application/ports/SaveValidatorPort";
import {SaveSectionsParserPort} from "../../save/application/ports/SaveSectionsParserPort";
import {GameReleasesReaderPort} from "../../save/application/ports/GameReleasesReaderPort";
import {SaveFileValidationPresenterPort} from "./ports/SaveFileValidationPresenterPort";
import {ValidateSaveFileRequest} from "./requests/ValidateSaveFileRequest";
import {collectSaveWarnings} from "../../save/domain/rules/collectSaveWarnings";
import {checkSaveInvariants} from "../../save/domain/rules/checkSaveInvariants";

export class ValidateSaveFile implements UseCase<ValidateSaveFileRequest> {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly parser: SaveSectionsParserPort,
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
      this.presenter.presentInvalidSaveFile({errors: validation.errors, warnings});
      return;
    }

    const {sections, errors: unreadableLines} = this.parser.parse(content);
    const brokenInvariant = checkSaveInvariants(sections, unreadableLines);

    if (brokenInvariant?.code === 'unreadable-lines') {
      this.presenter.presentSaveFileWithUnreadableLines({unreadableLines: brokenInvariant.unreadableLines, warnings});
      return;
    }

    if (brokenInvariant !== null) {
      this.presenter.presentSaveFileWithoutUniqueHost(brokenInvariant.hostCount, warnings);
      return;
    }

    this.presenter.presentValidSaveFile(warnings);
  }
}
