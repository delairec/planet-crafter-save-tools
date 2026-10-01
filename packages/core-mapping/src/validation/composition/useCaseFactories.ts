import {SaveValidatorService} from "../../save/infrastructure/SaveValidatorService";
import {SaveSectionsParserService} from "../../save/infrastructure/SaveSectionsParserService";
import {GameReleasesReaderService} from "../../save/infrastructure/GameReleasesReaderService";
import {ValidateSaveFile} from "../application/ValidateSaveFile";
import {SaveFileValidationPresenterPort} from "../application/ports/SaveFileValidationPresenterPort";
import {SaveFileValidationPresenter} from "../presentation/SaveFileValidationPresenter";
import {SaveFileValidationViewModel} from "../presentation/viewModels/SaveFileValidationViewModel";
import {LoadSaveFilePresenter} from "../presentation/LoadSaveFilePresenter";
import {LoadSaveFileViewModel} from "../presentation/viewModels/LoadSaveFileViewModel";
import {ValidateSaveFileRequest} from "../application/requests/ValidateSaveFileRequest";
import {UseCaseWithPresenter} from "../../save/controllers/UseCaseFactory";

export function createValidateSaveFile(): UseCaseWithPresenter<ValidateSaveFileRequest, SaveFileValidationViewModel> {
  const presenter = new SaveFileValidationPresenter();
  return {useCase: createValidateSaveFileUseCase(presenter), presenter};
}

function createValidateSaveFileUseCase(presenter: SaveFileValidationPresenterPort): ValidateSaveFile {
  return new ValidateSaveFile(new SaveValidatorService(), new SaveSectionsParserService(), new GameReleasesReaderService(), presenter);
}

export function createLoadAndValidateSaveFile(): UseCaseWithPresenter<ValidateSaveFileRequest, LoadSaveFileViewModel> {
  const presenter = new LoadSaveFilePresenter();
  return {useCase: createValidateSaveFileUseCase(presenter), presenter};
}
