import {PlayersMenuViewModel} from "../presentation/viewModels/PlayersMenuViewModel";
import {PlayersMenuPresenter} from "../presentation/PlayersMenuPresenter";
import {LoadPlayersMenu} from "../application/LoadPlayersMenu";
import {createSaveSectionsReader} from "../composition/compositionRoot";

export class LoadPlayersMenuController {
  static async loadPlayersMenu(validatedContent: string): Promise<PlayersMenuViewModel> {
    const saveReader = createSaveSectionsReader(validatedContent);
    const presenter = new PlayersMenuPresenter();
    const useCase = new LoadPlayersMenu(saveReader, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
