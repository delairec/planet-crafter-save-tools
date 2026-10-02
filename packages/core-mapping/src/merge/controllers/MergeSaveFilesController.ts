import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {MergeSaveFilesRequest} from "../application/requests/MergeSaveFilesRequest";
import {MergeSaveFilesInput} from "./MergeSaveFilesInput";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export class MergeSaveFilesController {
  constructor(private readonly createMergeSaveFiles: UseCaseFactory<MergeSaveFilesRequest, MergeResultViewModel>) {
  }

  async mergeSaveFiles({fileNameA, contentA, fileNameB, contentB, saveDisplayName, preferLegacyFormat}: MergeSaveFilesInput): Promise<MergeResultViewModel> {
    const request: MergeSaveFilesRequest = {fileNameA, contentA, fileNameB, contentB, saveDisplayName, preferLegacyFormat};
    const {useCase, presenter} = this.createMergeSaveFiles();

    await useCase.execute(request);

    return presenter.viewModel;
  }
}
