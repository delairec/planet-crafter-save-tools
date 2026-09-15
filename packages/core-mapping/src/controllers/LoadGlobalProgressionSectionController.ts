import {GlobalProgressionViewModel} from '../presentation/viewModels/GlobalProgressionViewModel';
import {GlobalProgressionPresenter} from '../presentation/GlobalProgressionPresenter';
import {LoadGlobalProgressionSection} from '../application/LoadGlobalProgressionSection';
import {createSaveSectionsReader} from '../composition/compositionRoot';

export class LoadGlobalProgressionSectionController {

  static async loadGlobalProgressionSection(validatedContent: string): Promise<GlobalProgressionViewModel> {
    const saveReader = createSaveSectionsReader(validatedContent);
    const presenter = new GlobalProgressionPresenter();
    const useCase = new LoadGlobalProgressionSection(saveReader, presenter);

    await useCase.execute();

    return presenter.viewModel;
  }
}
