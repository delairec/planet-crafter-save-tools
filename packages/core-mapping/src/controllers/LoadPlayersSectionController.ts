import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {PlayersPresenter} from '../presentation/PlayersPresenter';
import {PlayersPresenterPort} from '../application/ports/PlayersPresenterPort';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UseCaseFactory} from '../application/UseCaseFactory';
import {createLoadPlayersSection} from '../composition/compositionRoot';

export class LoadPlayersSectionController {
  constructor(private readonly createLoadPlayersSection: UseCaseFactory<PlayersPresenterPort, LoadSaveSectionsRequest>) {
  }

  async loadPlayersSection(validatedContent: string): Promise<PlayersViewModel> {
    const presenter = new PlayersPresenter();
    const useCase = this.createLoadPlayersSection(presenter);

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}

export const loadPlayersSectionController = new LoadPlayersSectionController(createLoadPlayersSection);
