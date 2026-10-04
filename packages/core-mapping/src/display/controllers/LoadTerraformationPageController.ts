import {TerraformationPageViewModel} from "../presentation/viewModels/TerraformationPageViewModel";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export class LoadTerraformationPageController {
  constructor(private readonly createLoadTerraformationPage: UseCaseFactory<LoadSaveSectionsRequest, TerraformationPageViewModel>) {
  }

  async loadTerraformationPage(validatedContent: string): Promise<TerraformationPageViewModel> {
    const {useCase, presenter} = this.createLoadTerraformationPage();

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
