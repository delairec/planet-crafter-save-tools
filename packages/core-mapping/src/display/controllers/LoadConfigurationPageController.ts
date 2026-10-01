import {ConfigurationPageViewModel} from "../presentation/viewModels/ConfigurationPageViewModel";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export class LoadConfigurationPageController {
  constructor(private readonly createLoadConfigurationPage: UseCaseFactory<LoadSaveSectionsRequest, ConfigurationPageViewModel>) {
  }

  async loadConfigurationPage(validatedContent: string): Promise<ConfigurationPageViewModel> {
    const {useCase, presenter} = this.createLoadConfigurationPage();

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
