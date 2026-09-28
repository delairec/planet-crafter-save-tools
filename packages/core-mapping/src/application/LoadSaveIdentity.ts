import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {GameReleasesReaderPort} from "./ports/GameReleasesReaderPort";
import {SaveIdentityPresenterPort} from "./ports/SaveIdentityPresenterPort";
import {LoadSaveIdentityRequest} from "./requests/LoadSaveIdentityRequest";
import {resolveGameReleaseOfDeclaredVersion} from "../domain/rules/resolveGameReleaseOfDeclaredVersion";

export class LoadSaveIdentity {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly gameReleasesReader: GameReleasesReaderPort,
    private readonly presenter: SaveIdentityPresenterPort
  ) {}

  async execute({content, fileName}: LoadSaveIdentityRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines(fileName, {unreadableLines});
      return;
    }

    const saveConfiguration = saveSections.getSaveConfiguration();

    if (!saveConfiguration) {
      this.presenter.displayUnconfiguredSaveIdentity(fileName);
      return;
    }

    this.presenter.displaySaveIdentity({
      fileName,
      displayName: saveConfiguration.title,
      mode: saveConfiguration.mode,
      gameRelease: resolveGameReleaseOfDeclaredVersion(saveSections.getDeclaredVersion(), this.gameReleasesReader.readGameReleases())
    });
  }
}
