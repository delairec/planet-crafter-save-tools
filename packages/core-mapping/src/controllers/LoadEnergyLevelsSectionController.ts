import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";
import {EnergyLevelsPresenterPort} from "../application/ports/EnergyLevelsPresenterPort";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "./UseCaseFactory";
import {createLoadEnergyLevelsSection} from "../composition/compositionRoot";

export class LoadEnergyLevelsSectionController {
  constructor(private readonly createLoadEnergyLevelsSection: UseCaseFactory<EnergyLevelsPresenterPort, LoadSaveSectionsRequest>) {
  }

  async loadEnergyLevelsSection(validatedContent: string): Promise<EnergyLevelsViewModel> {
    const presenter = new EnergyLevelsPresenter();
    const useCase = this.createLoadEnergyLevelsSection(presenter);

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}

export const loadEnergyLevelsSectionController = new LoadEnergyLevelsSectionController(createLoadEnergyLevelsSection);
