import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {GlobalProgressionPresenterPort} from "./ports/GlobalProgressionPresenterPort";

export class LoadGlobalProgressionSection {
  constructor(
    private readonly saveParser: SaveSectionsReaderPort,
    private readonly presenter: GlobalProgressionPresenterPort,
  ) {}

  async execute(): Promise<void> {
    const globalProgression = this.saveParser.getGlobalMetadata();
    const statistics = this.saveParser.getStatistics();

    if (!statistics) {
      this.presenter.displayGlobalProgressionWithoutStatistics(globalProgression);
      return;
    }

    this.presenter.displayGlobalProgression(globalProgression, statistics);
  }
}
