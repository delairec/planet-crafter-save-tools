import {SaveFileValidationViewModel} from "../presentation/viewModels/SaveFileValidationViewModel";
import {SaveFileValidationPresenter} from "../presentation/SaveFileValidationPresenter";
import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest";
import {UseCaseFactory} from "../application/UseCaseFactory";
import {createValidateSaveFile} from "../composition/compositionRoot";

export class ValidateSaveFileController {
  constructor(private readonly createValidateSaveFile: UseCaseFactory<SaveFileValidationPresenterPort, ValidateSaveFileRequest>) {
  }

  async validateSaveFile(fileName: string, content: string): Promise<SaveFileValidationViewModel> {
    const request: ValidateSaveFileRequest = {fileName, content};
    const presenter = new SaveFileValidationPresenter();
    const useCase = this.createValidateSaveFile(presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}

export const validateSaveFileController = new ValidateSaveFileController(createValidateSaveFile);
