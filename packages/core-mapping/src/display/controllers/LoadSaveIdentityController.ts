import {SaveIdentityViewModel} from "../presentation/viewModels/SaveIdentityViewModel";
import {LoadSaveIdentityRequest} from "../application/requests/LoadSaveIdentityRequest";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export class LoadSaveIdentityController {
  constructor(private readonly createLoadSaveIdentity: UseCaseFactory<LoadSaveIdentityRequest, SaveIdentityViewModel>) {
  }

  async loadSaveIdentity(validatedContent: string, fileName: string): Promise<SaveIdentityViewModel> {
    const {useCase, presenter} = this.createLoadSaveIdentity();

    await useCase.execute({content: validatedContent, fileName});

    return presenter.viewModel;
  }
}
