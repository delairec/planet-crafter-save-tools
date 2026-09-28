import {ConfigurationPageViewModel} from "../presentation/viewModels/ConfigurationPageViewModel";
import {ConfigurationPagePresenter} from "../presentation/ConfigurationPagePresenter";
import {LoadConfigurationPage} from "../application/LoadConfigurationPage";
import {createSaveSectionsReader} from "../composition/compositionRoot";

export class LoadConfigurationPageController {
  static async loadConfigurationPage(validatedContent: string): Promise<ConfigurationPageViewModel> {
    const saveReader = createSaveSectionsReader(validatedContent);
    const presenter = new ConfigurationPagePresenter();
    const useCase = new LoadConfigurationPage(saveReader, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
