import {SaveIdentityViewModel} from "../presentation/viewModels/SaveIdentityViewModel";
import {SaveIdentityPresenter} from "../presentation/SaveIdentityPresenter";
import {SaveIdentityPresenterPort} from "../application/ports/SaveIdentityPresenterPort";
import {LoadSaveIdentityRequest} from "../application/requests/LoadSaveIdentityRequest";
import {UseCaseFactory} from "../application/UseCaseFactory";
import {createLoadSaveIdentity} from "../composition/compositionRoot";

export class LoadSaveIdentityController {
  constructor(private readonly createLoadSaveIdentity: UseCaseFactory<SaveIdentityPresenterPort, LoadSaveIdentityRequest>) {
  }

  async loadSaveIdentity(validatedContent: string, fileName: string): Promise<SaveIdentityViewModel> {
    const presenter = new SaveIdentityPresenter();
    const useCase = this.createLoadSaveIdentity(presenter);

    await useCase.execute({content: validatedContent, fileName});

    return presenter.viewModel;
  }
}

export const loadSaveIdentityController = new LoadSaveIdentityController(createLoadSaveIdentity);
