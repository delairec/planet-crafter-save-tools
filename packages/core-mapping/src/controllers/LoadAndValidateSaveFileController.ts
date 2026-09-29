import {LoadSaveFileViewModel} from "../presentation/viewModels/LoadSaveFileViewModel";
import {createSaveSectionsReader, createSaveValidator} from "../composition/compositionRoot";
import {LoadSaveFilePresenter} from "../presentation/LoadSaveFilePresenter";
import {LoadAndValidateSaveFile} from "../application/LoadAndValidateSaveFile";
import {LoadAndValidateSaveFileRequest} from "../application/requests/LoadAndValidateSaveFileRequest";

export class LoadAndValidateSaveFileController {
  static async loadAndValidateSaveFile(fileName: string, content: string): Promise<LoadSaveFileViewModel> {
    const request: LoadAndValidateSaveFileRequest = {fileName, content};
    const validator = createSaveValidator();
    const saveSectionsReader = createSaveSectionsReader();
    const presenter = new LoadSaveFilePresenter();
    const useCase = new LoadAndValidateSaveFile(validator, saveSectionsReader, presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
