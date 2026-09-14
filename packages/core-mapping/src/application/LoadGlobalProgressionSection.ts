import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {GlobalProgressionPresenterPort} from "./ports/GlobalProgressionPresenterPort";

export class LoadGlobalProgressionSection {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: GlobalProgressionPresenterPort,
  ) {}

  async execute(): Promise<void> {
    const globalProgression = this.saveSectionsReader.getGlobalProgression();
    const statistics = this.saveSectionsReader.getStatistics();

    if (!statistics) {
      this.presenter.displayGlobalProgressionWithoutStatistics(globalProgression);
      return;
    }

    this.presenter.displayGlobalProgression(globalProgression, statistics);
  }
}
