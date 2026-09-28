import {SaveFileValidationViewModel} from "../presentation/viewModels/SaveFileValidationViewModel";
import {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest";
import {UseCaseFactory} from "./UseCaseFactory";

export class ValidateSaveFileController {
  constructor(private readonly createValidateSaveFile: UseCaseFactory<ValidateSaveFileRequest, SaveFileValidationViewModel>) {
  }

  async validateSaveFile(fileName: string, content: string): Promise<SaveFileValidationViewModel> {
    const request: ValidateSaveFileRequest = {fileName, content};
    const {useCase, presenter} = this.createValidateSaveFile();

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
