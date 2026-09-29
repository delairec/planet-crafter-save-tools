import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {PlayersPresenter} from '../presentation/PlayersPresenter';
import {LoadPlayersSection} from '../application/LoadPlayersSection';
import {createSaveSectionsReader} from '../composition/compositionRoot';

export class LoadPlayersSectionController {

  static async loadPlayersSection(validatedContent: string): Promise<PlayersViewModel> {
    const saveReader = createSaveSectionsReader();
    const presenter = new PlayersPresenter();
    const useCase = new LoadPlayersSection(saveReader, presenter);

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
