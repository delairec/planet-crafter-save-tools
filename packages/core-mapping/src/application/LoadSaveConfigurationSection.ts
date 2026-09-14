import {SaveSectionsReaderPort} from "./ports/SaveSectionsReaderPort";
import {SaveConfigurationPresenterPort} from "./ports/SaveConfigurationPresenterPort";


export class LoadSaveConfigurationSection {
  constructor(
    private readonly saveSectionsReader: SaveSectionsReaderPort,
    private readonly presenter: SaveConfigurationPresenterPort
  ) {}

  async execute(): Promise<void> {
    const saveConfiguration = this.saveSectionsReader.getSaveConfiguration();

    if (!saveConfiguration) {
      this.presenter.displayMissingSaveConfigurationSection();
      return;
    }

    this.presenter.displaySaveConfiguration(saveConfiguration);
  }
}
