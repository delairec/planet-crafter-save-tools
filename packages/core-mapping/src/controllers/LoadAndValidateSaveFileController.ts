import {LoadSaveFileViewModel} from "../presentation/viewModels/LoadSaveFileViewModel";
import {createGameReleasesReader, createSaveSectionsReader, createSaveValidator} from "../composition/compositionRoot";
import {LoadSaveFilePresenter} from "../presentation/LoadSaveFilePresenter";
import {ValidateSaveFile} from "../application/ValidateSaveFile";
import {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest";

export class LoadAndValidateSaveFileController {
  static async loadAndValidateSaveFile(fileName: string, content: string): Promise<LoadSaveFileViewModel> {
    const request: ValidateSaveFileRequest = {fileName, content};
    const validator = createSaveValidator();
    const saveSectionsReader = createSaveSectionsReader();
    const presenter = new LoadSaveFilePresenter();
    const useCase = new ValidateSaveFile(validator, saveSectionsReader, createGameReleasesReader(), presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
