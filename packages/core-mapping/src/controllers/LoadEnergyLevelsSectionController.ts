import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {createSaveSectionsReader} from "../composition/compositionRoot";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";

export class LoadEnergyLevelsSectionController {

  static async loadEnergyLevelsSection(validatedContent: string): Promise<EnergyLevelsViewModel> {
    const saveReader = createSaveSectionsReader(validatedContent);
    const presenter = new EnergyLevelsPresenter();
    const useCase = new LoadEnergyLevelsSection(saveReader, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
