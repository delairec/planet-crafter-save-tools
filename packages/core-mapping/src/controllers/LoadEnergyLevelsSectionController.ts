import {EnergyLevelsViewModel} from "../presentation/viewModels/EnergyLevelsViewModel";
import {
  createEnergyLevelsReader,
  createGameReleasesReader,
  createOptimizerRangesReader,
  createPlanetNamesReader,
  createSaveSectionsReader,
  createWorldObjectLabelsReader
} from "../composition/compositionRoot";
import {EnergyLevelsPresenter} from "../presentation/EnergyLevelsPresenter";
import {LoadEnergyLevelsSection} from "../application/LoadEnergyLevelsSection";

export class LoadEnergyLevelsSectionController {

  static async loadEnergyLevelsSection(validatedContent: string): Promise<EnergyLevelsViewModel> {
    const presenter = new EnergyLevelsPresenter();
    const useCase = new LoadEnergyLevelsSection({
      saveSectionsReader: createSaveSectionsReader(),
      energyLevelsReader: createEnergyLevelsReader(),
      gameReleasesReader: createGameReleasesReader(),
      optimizerRangesReader: createOptimizerRangesReader(),
      planetNamesReader: createPlanetNamesReader(),
      worldObjectLabelsReader: createWorldObjectLabelsReader()
    }, presenter);

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
