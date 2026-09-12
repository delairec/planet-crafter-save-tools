import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {createMergedSaveSerializer, createMergeSourceReader, createSaveValidator} from "../composition/compositionRoot";
import {MergeResultPresenter} from "../presentation/MergeResultPresenter";
import {MergeSaveFiles} from "../application/MergeSaveFiles";
import {MergeSaveFilesRequest} from "../application/requests/MergeSaveFilesRequest";

export class MergeSaveFilesController {
  static async mergeSaveFiles(request: MergeSaveFilesRequest): Promise<MergeResultViewModel> {
    const validator = createSaveValidator();
    const sourceReader = createMergeSourceReader();
    const serializer = createMergedSaveSerializer();
    const presenter = new MergeResultPresenter();
    const useCase = new MergeSaveFiles(validator, sourceReader, serializer, presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
