import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {MergeSaveFilesRequest} from "../application/requests/MergeSaveFilesRequest";
import {UseCaseFactory} from "./UseCaseFactory";

export class MergeSaveFilesController {
  constructor(private readonly createMergeSaveFiles: UseCaseFactory<MergeSaveFilesRequest, MergeResultViewModel>) {
  }

  async mergeSaveFiles(request: MergeSaveFilesRequest): Promise<MergeResultViewModel> {
    const {useCase, presenter} = this.createMergeSaveFiles();

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
