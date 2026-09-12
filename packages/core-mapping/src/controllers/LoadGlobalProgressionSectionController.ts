import {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenter} from '../presentation/GlobalProgressionPresenter';
import {LoadGlobalProgressionSection} from '../application/LoadGlobalProgressionSection';
import {SaveSectionsReaderService} from '../infrastructure/SaveSectionsReaderService';
import {SaveSections} from "../domain/save/SaveSections";

export class LoadGlobalProgressionSectionController {

  static async loadGlobalProgressionSection(sections: SaveSections): Promise<GlobalProgressionViewModel> {
    const saveParser = new SaveSectionsReaderService(sections);
    const presenter = new GlobalProgressionPresenter();
    const useCase = new LoadGlobalProgressionSection(saveParser, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}


