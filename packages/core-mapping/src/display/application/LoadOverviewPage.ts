import {UseCase} from "../../save/application/UseCase";
import {GameReleasesReaderPort} from "../../save/application/ports/GameReleasesReaderPort";
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {SaveSectionsMapperPort} from "./ports/SaveSectionsMapperPort";
import {OverviewPagePresenterPort} from "./ports/OverviewPagePresenterPort";
import {LoadOverviewPageRequest} from "./requests/LoadOverviewPageRequest";
import {OverviewProgressionResponse, OverviewSaveConfigurationResponse} from "./responses/OverviewPageResponse";
import {DroneLogisticsResponse} from "./responses/DroneLogisticsResponse";
import {resolveGameReleaseOfDeclaredVersion} from "../domain/rules/resolveGameReleaseOfDeclaredVersion";
import {assessDroneLogistics} from "../domain/rules/assessDroneLogistics";

export class LoadOverviewPage implements UseCase<LoadOverviewPageRequest> {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly gameReleasesReader: GameReleasesReaderPort,
    private readonly presenter: OverviewPagePresenterPort
  ) {}

  async execute({content, fileName, fileSize}: LoadOverviewPageRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines({unreadableLines});
      return;
    }

    this.presenter.displayOverviewPage({
      saveFile: {name: fileName, size: fileSize},
      saveConfiguration: this.describeSaveConfiguration(saveSections),
      progression: describeProgression(saveSections)
    });
  }

  private describeSaveConfiguration(saveSections: SaveSectionsMapperPort): OverviewSaveConfigurationResponse | undefined {
    const saveConfiguration = saveSections.getSaveConfiguration();
    if (!saveConfiguration) {
      return undefined;
    }
    return {
      displayName: saveConfiguration.title,
      mode: saveConfiguration.mode,
      gameRelease: resolveGameReleaseOfDeclaredVersion(saveSections.getDeclaredVersion(), this.gameReleasesReader.readGameReleases())
    };
  }
}

function describeProgression(saveSections: SaveSectionsMapperPort): OverviewProgressionResponse {
  const globalProgression = saveSections.getGlobalProgression();
  return {
    allTimeTerraTokens: globalProgression.allTimeTerraTokens,
    totalCraftedObjects: saveSections.getStatistics()?.totalCraftedObjects,
    droneLogistics: describeDroneLogistics(globalProgression.logisticsPaused)
  };
}

function describeDroneLogistics(logisticsPaused: boolean | undefined): DroneLogisticsResponse | undefined {
  if (logisticsPaused === undefined) {
    return undefined;
  }
  return {paused: logisticsPaused, effect: assessDroneLogistics(logisticsPaused)};
}
