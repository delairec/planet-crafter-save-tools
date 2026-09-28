import {PlayersMenuViewModel} from "../presentation/viewModels/PlayersMenuViewModel";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "./UseCaseFactory";

export class LoadPlayersMenuController {
  constructor(private readonly createLoadPlayersMenu: UseCaseFactory<LoadSaveSectionsRequest, PlayersMenuViewModel>) {
  }

  async loadPlayersMenu(validatedContent: string): Promise<PlayersMenuViewModel> {
    const {useCase, presenter} = this.createLoadPlayersMenu();

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
