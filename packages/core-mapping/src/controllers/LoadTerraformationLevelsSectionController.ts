import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';
import {TerraformationLevelsPresenter} from '../presentation/TerraformationLevelsPresenter';
import {LoadTerraformationLevelsSection} from '../application/LoadTerraformationLevelsSection';
import {createSaveSectionsReader} from '../composition/compositionRoot';

export class LoadTerraformationLevelsSectionController {
  static async loadTerraformationLevelsSection(validatedContent: string): Promise<TerraformationLevelsViewModel> {
    const saveReader = createSaveSectionsReader(validatedContent);
    const presenter = new TerraformationLevelsPresenter();
    const useCase = new LoadTerraformationLevelsSection(saveReader, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
