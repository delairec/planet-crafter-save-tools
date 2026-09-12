import {SaveSections} from "../domain/save/SaveSections";
import {SaveConfigurationViewModel} from "../presentation/viewModels/SaveConfigurationViewModel";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {SaveConfigurationPresenter} from "../presentation/SaveConfigurationPresenter";
import {LoadSaveConfigurationSection} from "../application/LoadSaveConfigurationSection";

export class LoadSaveConfigurationSectionController {
  static async loadSaveConfigurationSection(sections: SaveSections): Promise<SaveConfigurationViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new SaveConfigurationPresenter();
    const useCase = new LoadSaveConfigurationSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
