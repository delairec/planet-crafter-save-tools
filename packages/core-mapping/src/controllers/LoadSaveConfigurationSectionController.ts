import {SaveConfigurationViewModel} from "../presentation/viewModels/SaveConfigurationViewModel";
import {createSaveSectionsReader} from "../composition/compositionRoot";
import {SaveConfigurationPresenter} from "../presentation/SaveConfigurationPresenter";
import {LoadSaveConfigurationSection} from "../application/LoadSaveConfigurationSection";

export class LoadSaveConfigurationSectionController {
  static async loadSaveConfigurationSection(validatedContent: string): Promise<SaveConfigurationViewModel> {
    const saveReader = createSaveSectionsReader(validatedContent);
    const presenter = new SaveConfigurationPresenter();
    const useCase = new LoadSaveConfigurationSection(saveReader, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
