import {SaveSections} from "../domain/save/SaveSections";
import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {SaveSectionsReaderService} from "../infrastructure/SaveSectionsReaderService";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";

export class LoadEnergyLevelsSectionController {

  static async loadEnergyLevelsSection(sections: SaveSections): Promise<EnergyLevelsViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new EnergyLevelsPresenter();
    const useCase = new LoadEnergyLevelsSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
