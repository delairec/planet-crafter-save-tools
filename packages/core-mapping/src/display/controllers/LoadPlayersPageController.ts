import {PlayersPageViewModel} from "../presentation/viewModels/PlayersPageViewModel";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export class LoadPlayersPageController {
  constructor(private readonly createLoadPlayersPage: UseCaseFactory<LoadSaveSectionsRequest, PlayersPageViewModel>) {
  }

  async loadPlayersPage(validatedContent: string): Promise<PlayersPageViewModel> {
    const {useCase, presenter} = this.createLoadPlayersPage();

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
