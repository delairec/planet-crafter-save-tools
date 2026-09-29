import {SaveValidatorPort} from "./ports/SaveValidatorPort";
import {SaveSectionsParserPort} from "./ports/SaveSectionsParserPort";
import {LoadAndValidateSaveFilePresenterPort} from "./ports/LoadAndValidateSaveFilePresenterPort";
import {LoadAndValidateSaveFileRequest} from "./requests/LoadAndValidateSaveFileRequest";

export class LoadAndValidateSaveFile {
  constructor(
    private readonly validator: SaveValidatorPort,
    private readonly parser: SaveSectionsParserPort,
    private readonly presenter: LoadAndValidateSaveFilePresenterPort
  ) {
  }

  async execute({fileName, content}: LoadAndValidateSaveFileRequest): Promise<void> {
    const validation = this.validator.validate(fileName, content);

    if (!validation.isValid) {
      this.presenter.presentInvalidSaveFile(validation.errors, validation.warnings);
      return;
    }

    const {errors: unreadableLines} = this.parser.parse(content);

    if (unreadableLines.length > 0) {
      this.presenter.presentSaveFileWithUnreadableLines(unreadableLines, validation.warnings);
      return;
    }

    this.presenter.presentLoadedSaveFile(validation.warnings);
  }
}
