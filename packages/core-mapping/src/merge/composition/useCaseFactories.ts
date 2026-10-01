import {SaveValidatorService} from "../../save/infrastructure/SaveValidatorService";
import {SaveSectionsParserService} from "../../save/infrastructure/SaveSectionsParserService";
import {SaveSectionsSerializerService} from "../infrastructure/SaveSectionsSerializerService";
import {GameReleasesReaderService} from "../../save/infrastructure/GameReleasesReaderService";
import {FileNameSanitizerService} from "../infrastructure/FileNameSanitizerService";
import {MergeSaveFiles} from "../application/MergeSaveFiles";
import {MergeResultPresenter} from "../presentation/MergeResultPresenter";
import {MergeResultViewModel} from "../presentation/viewModels/MergeResultViewModel";
import {MergeSaveFilesRequest} from "../application/requests/MergeSaveFilesRequest";
import {UseCaseWithPresenter} from "../../save/controllers/UseCaseFactory";

export function createMergeSaveFiles(): UseCaseWithPresenter<MergeSaveFilesRequest, MergeResultViewModel> {
  const presenter = new MergeResultPresenter();
  return {useCase: createMergeSaveFilesUseCase(presenter), presenter};
}

function createMergeSaveFilesUseCase(presenter: MergeResultPresenter): MergeSaveFiles {
  return new MergeSaveFiles(
    new SaveValidatorService(),
    new SaveSectionsParserService(),
    new SaveSectionsSerializerService(),
    new GameReleasesReaderService(),
    new FileNameSanitizerService(),
    presenter
  );
}
