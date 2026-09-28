import {SaveIdentityViewModel} from "../presentation/viewModels/SaveIdentityViewModel";
import {SaveIdentityPresenter} from "../presentation/SaveIdentityPresenter";
import {LoadSaveIdentity} from "../application/LoadSaveIdentity";
import {createSaveSectionsReader} from "../composition/compositionRoot";

export class LoadSaveIdentityController {
  static async loadSaveIdentity(validatedContent: string, fileName: string): Promise<SaveIdentityViewModel> {
    const saveReader = createSaveSectionsReader(validatedContent);
    const presenter = new SaveIdentityPresenter();
    const useCase = new LoadSaveIdentity(saveReader, presenter);

    await useCase.execute({fileName});

    return presenter.viewModel;
  }
}
