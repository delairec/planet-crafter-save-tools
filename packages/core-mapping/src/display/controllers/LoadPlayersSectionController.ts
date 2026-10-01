import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {LoadSaveSectionsRequest} from '../application/requests/LoadSaveSectionsRequest';
import {UseCaseFactory} from '../../save/controllers/UseCaseFactory';

export class LoadPlayersSectionController {
  constructor(private readonly createLoadPlayersSection: UseCaseFactory<LoadSaveSectionsRequest, PlayersViewModel>) {
  }

  async loadPlayersSection(validatedContent: string): Promise<PlayersViewModel> {
    const {useCase, presenter} = this.createLoadPlayersSection();

    await useCase.execute({content: validatedContent});

    return presenter.viewModel;
  }
}
