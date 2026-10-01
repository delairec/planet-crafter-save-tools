import {LoadSaveFileViewModel} from "../presentation/viewModels/LoadSaveFileViewModel";
import {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export class LoadAndValidateSaveFileController {
  constructor(private readonly createValidateSaveFile: UseCaseFactory<ValidateSaveFileRequest, LoadSaveFileViewModel>) {
  }

  async loadAndValidateSaveFile(fileName: string, content: string): Promise<LoadSaveFileViewModel> {
    const request: ValidateSaveFileRequest = {fileName, content};
    const {useCase, presenter} = this.createValidateSaveFile();

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
