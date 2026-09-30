import {SaveIdentityViewModel} from "../presentation/viewModels/SaveIdentityViewModel";
import {SaveIdentityPresenter} from "../presentation/SaveIdentityPresenter";
import {LoadSaveIdentity} from "../application/LoadSaveIdentity";
import {createGameReleasesReader, createSaveSectionsReader} from "../composition/compositionRoot";

export class LoadSaveIdentityController {
  static async loadSaveIdentity(validatedContent: string, fileName: string): Promise<SaveIdentityViewModel> {
    const saveReader = createSaveSectionsReader();
    const presenter = new SaveIdentityPresenter();
    const useCase = new LoadSaveIdentity(saveReader, createGameReleasesReader(), presenter);

    await useCase.execute({content: validatedContent, fileName});

    return presenter.viewModel;
  }
}
