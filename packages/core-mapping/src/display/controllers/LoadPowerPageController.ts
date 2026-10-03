import {PowerPageViewModel} from "../presentation/viewModels/PowerPageViewModel";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export class LoadPowerPageController {
  constructor(private readonly createLoadPowerPage: UseCaseFactory<LoadSaveSectionsRequest, PowerPageViewModel>) {
  }

  async loadPowerPage(validatedContent: string): Promise<PowerPageViewModel> {
    const {useCase, presenter} = this.createLoadPowerPage();

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
