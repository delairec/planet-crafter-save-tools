import {TerraformationLevelsPresenterPort} from './ports/TerraformationLevelsPresenterPort';
import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";

export class LoadTerraformationLevelsSection {
  constructor(
    private saveSectionsReader: SaveSectionsReaderPort,
    private presenter: TerraformationLevelsPresenterPort
  ) {}

  async execute(): Promise<void> {
    const levelsWithSummary = this.saveSectionsReader.getTerraformationLevels().map((level) => level.summarize());

    this.presenter.displayTerraformationLevels(levelsWithSummary);
  }
}
