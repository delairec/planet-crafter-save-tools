import {SaveFileValidationViewModel} from "../presentation/viewModels/SaveFileValidationViewModel";
import {createSaveSectionsReader, createSaveValidator} from "../composition/compositionRoot";
import {SaveFileValidationPresenter} from "../presentation/SaveFileValidationPresenter";
import {ValidateSaveFile} from "../application/ValidateSaveFile";
import {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest";

export class ValidateSaveFileController {
  static async validateSaveFile(fileName: string, content: string): Promise<SaveFileValidationViewModel> {
    const request: ValidateSaveFileRequest = {fileName, content};
    const validator = createSaveValidator();
    const saveSectionsReader = createSaveSectionsReader();
    const presenter = new SaveFileValidationPresenter();
    const useCase = new ValidateSaveFile(validator, saveSectionsReader, presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
