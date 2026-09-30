import {ConfigurationPageViewModel} from "../presentation/viewModels/ConfigurationPageViewModel";
import {ConfigurationPagePresenter} from "../presentation/ConfigurationPagePresenter";
import {ConfigurationPagePresenterPort} from "../application/ports/ConfigurationPagePresenterPort";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "./UseCaseFactory";

export class LoadConfigurationPageController {
  constructor(private readonly createLoadConfigurationPage: UseCaseFactory<ConfigurationPagePresenterPort, LoadSaveSectionsRequest>) {
  }

  async loadConfigurationPage(validatedContent: string): Promise<ConfigurationPageViewModel> {
    const presenter = new ConfigurationPagePresenter();
    const useCase = this.createLoadConfigurationPage(presenter);

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
