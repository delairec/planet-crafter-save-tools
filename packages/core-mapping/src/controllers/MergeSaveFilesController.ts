import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {createSaveSectionsParser, createSaveSectionsReader, createSaveSectionsSerializer, createSaveValidator} from "../composition/compositionRoot";
import {MergeResultPresenter} from "../presentation/MergeResultPresenter";
import {MergeSaveFiles} from "../application/MergeSaveFiles";
import {MergeSaveFilesRequest} from "../application/requests/MergeSaveFilesRequest";

export class MergeSaveFilesController {
  static async mergeSaveFiles(request: MergeSaveFilesRequest): Promise<MergeResultViewModel> {
    const validator = createSaveValidator();
    const saveSectionsReader = createSaveSectionsReader();
    const parser = createSaveSectionsParser();
    const serializer = createSaveSectionsSerializer();
    const presenter = new MergeResultPresenter();
    const useCase = new MergeSaveFiles(validator, saveSectionsReader, parser, serializer, presenter);

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
