import {PlayersMenuViewModel} from "../presentation/viewModels/PlayersMenuViewModel";
import {PlayersMenuPresenter} from "../presentation/PlayersMenuPresenter";
import {PlayersMenuPresenterPort} from "../application/ports/PlayersMenuPresenterPort";
import {LoadSaveSectionsRequest} from "../application/requests/LoadSaveSectionsRequest";
import {UseCaseFactory} from "./UseCaseFactory";

export class LoadPlayersMenuController {
  constructor(private readonly createLoadPlayersMenu: UseCaseFactory<PlayersMenuPresenterPort, LoadSaveSectionsRequest>) {
  }

  async loadPlayersMenu(validatedContent: string): Promise<PlayersMenuViewModel> {
    const presenter = new PlayersMenuPresenter();
    const useCase = this.createLoadPlayersMenu(presenter);

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
