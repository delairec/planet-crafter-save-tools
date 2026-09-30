import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';
import {TerraformationLevelsPresenter} from '../presentation/TerraformationLevelsPresenter';
import {TerraformationLevelsPresenterPort} from '../application/ports/TerraformationLevelsPresenterPort';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UseCaseFactory} from './UseCaseFactory';
import {createLoadTerraformationLevelsSection} from '../composition/compositionRoot';

export class LoadTerraformationLevelsSectionController {
  constructor(private readonly createLoadTerraformationLevelsSection: UseCaseFactory<TerraformationLevelsPresenterPort, LoadSaveSectionsRequest>) {
  }

  async loadTerraformationLevelsSection(validatedContent: string): Promise<TerraformationLevelsViewModel> {
    const presenter = new TerraformationLevelsPresenter();
    const useCase = this.createLoadTerraformationLevelsSection(presenter);

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}

export const loadTerraformationLevelsSectionController = new LoadTerraformationLevelsSectionController(createLoadTerraformationLevelsSection);
