import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {MergeResultPresenter} from "../presentation/MergeResultPresenter";
import {MergeResultPresenterPort} from "../application/ports/MergeResultPresenterPort";
import {MergeSaveFilesRequest} from "../application/requests/MergeSaveFilesRequest";
import {UseCaseFactory} from "./UseCaseFactory";

export class MergeSaveFilesController {
  constructor(private readonly createMergeSaveFiles: UseCaseFactory<MergeResultPresenterPort, MergeSaveFilesRequest>) {
  }

  async mergeSaveFiles(request: MergeSaveFilesRequest): Promise<MergeResultViewModel> {
    const presenter = new MergeResultPresenter();
    const useCase = this.createMergeSaveFiles(presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
