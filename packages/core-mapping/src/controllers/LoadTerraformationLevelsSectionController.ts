import {TerraformationLevelsViewModel} from '../presentation/viewModels/TerraformationLevelsViewModel';
import {TerraformationLevelsPresenter} from '../presentation/TerraformationLevelsPresenter';
import {LoadTerraformationLevelsSection} from '../application/LoadTerraformationLevelsSection';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService';
import {SaveSections} from "../domain/save/SaveSections";

export class LoadTerraformationLevelsSectionController {
  static async loadTerraformationLevelsSection(sections: SaveSections): Promise<TerraformationLevelsViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new TerraformationLevelsPresenter();
    const useCase = new LoadTerraformationLevelsSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}

