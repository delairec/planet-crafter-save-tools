import {PlayersViewModel} from '../presentation/viewModels/PlayersViewModel';
import {PlayersPresenter} from '../presentation/PlayersPresenter';
import {LoadPlayersSection} from '../application/LoadPlayersSection';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService';
import {SaveSections} from "../domain/save/SaveSections";

export class LoadPlayersSectionController {

  static async loadPlayersSection(sections: SaveSections): Promise<PlayersViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new PlayersPresenter();
    const useCase = new LoadPlayersSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}


