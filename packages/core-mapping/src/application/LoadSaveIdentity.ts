import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {SaveIdentityPresenterPort} from "./ports/SaveIdentityPresenterPort";
import {LoadSaveIdentityRequest} from "./requests/LoadSaveIdentityRequest";
import {resolveGameReleaseOfDeclaredVersion} from "../domain/rules/resolveGameReleaseOfDeclaredVersion";

export class LoadSaveIdentity {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: SaveIdentityPresenterPort
  ) {}

  async execute(request: LoadSaveIdentityRequest): Promise<void> {
    const saveConfiguration = this.saveSectionsReader.getSaveConfiguration();

    if (!saveConfiguration) {
      this.presenter.displayUnconfiguredSaveIdentity(request.fileName);
      return;
    }

    this.presenter.displaySaveIdentity({
      fileName: request.fileName,
      displayName: saveConfiguration.title,
      mode: saveConfiguration.mode,
      gameRelease: resolveGameReleaseOfDeclaredVersion(this.saveSectionsReader.getDeclaredVersion())
    });
  }
}
