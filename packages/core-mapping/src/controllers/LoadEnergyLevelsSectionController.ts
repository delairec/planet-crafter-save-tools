import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "./UseCaseFactory";

export class LoadEnergyLevelsSectionController {
  constructor(private readonly createLoadEnergyLevelsSection: UseCaseFactory<LoadSaveSectionsRequest, EnergyLevelsViewModel>) {
  }

  async loadEnergyLevelsSection(validatedContent: string): Promise<EnergyLevelsViewModel> {
    const {useCase, presenter} = this.createLoadEnergyLevelsSection();

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
