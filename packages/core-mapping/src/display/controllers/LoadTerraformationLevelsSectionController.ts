import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UseCaseFactory} from '../../save/controllers/UseCaseFactory';

export class LoadTerraformationLevelsSectionController {
  constructor(private readonly createLoadTerraformationLevelsSection: UseCaseFactory<LoadSaveSectionsRequest, TerraformationLevelsViewModel>) {
  }

  async loadTerraformationLevelsSection(validatedContent: string): Promise<TerraformationLevelsViewModel> {
    const {useCase, presenter} = this.createLoadTerraformationLevelsSection();

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
