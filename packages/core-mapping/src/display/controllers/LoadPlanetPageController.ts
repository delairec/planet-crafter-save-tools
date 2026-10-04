import {PlanetPageViewModel} from "../presentation/viewModels/PlanetPageViewModel";
import {LoadPlanetPageRequest} from "../application/requests/LoadPlanetPageRequest";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export interface PlanetOfLoadedSave {
  readonly content: string;
  readonly planetIdentifier: string;
}

export class LoadPlanetPageController {
  constructor(private readonly createLoadPlanetPage: UseCaseFactory<LoadPlanetPageRequest, PlanetPageViewModel>) {
  }

  async loadPlanetPage({content, planetIdentifier}: PlanetOfLoadedSave): Promise<PlanetPageViewModel> {
    const {useCase, presenter} = this.createLoadPlanetPage();

    await useCase.execute({content, planetIdentifier});

    return presenter.viewModel;
  }
}
