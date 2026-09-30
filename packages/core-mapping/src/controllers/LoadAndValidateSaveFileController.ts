import {LoadSaveFileViewModel} from "../presentation/viewModels/LoadSaveFileViewModel";
import {LoadSaveFilePresenter} from "../presentation/LoadSaveFilePresenter";
import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest";
import {UseCaseFactory} from "./UseCaseFactory";
import {createValidateSaveFile} from "../composition/compositionRoot";

export class LoadAndValidateSaveFileController {
  constructor(private readonly createValidateSaveFile: UseCaseFactory<SaveFileValidationPresenterPort, ValidateSaveFileRequest>) {
  }

  async loadAndValidateSaveFile(fileName: string, content: string): Promise<LoadSaveFileViewModel> {
    const request: ValidateSaveFileRequest = {fileName, content};
    const presenter = new LoadSaveFilePresenter();
    const useCase = this.createValidateSaveFile(presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}

export const loadAndValidateSaveFileController = new LoadAndValidateSaveFileController(createValidateSaveFile);
