import {OverviewPageViewModel} from "../presentation/viewModels/OverviewPageViewModel";
import {LoadOverviewPageRequest} from "../application/requests/LoadOverviewPageRequest";
import {UseCaseFactory} from "../../save/controllers/UseCaseFactory";

export interface LoadedSaveFile {
  readonly content: string;
  readonly fileName: string;
  readonly fileSize: number;
}

export class LoadOverviewPageController {
  constructor(private readonly createLoadOverviewPage: UseCaseFactory<LoadOverviewPageRequest, OverviewPageViewModel>) {
  }

  async loadOverviewPage({content, fileName, fileSize}: LoadedSaveFile): Promise<OverviewPageViewModel> {
    const {useCase, presenter} = this.createLoadOverviewPage();

    await useCase.execute({content, fileName, fileSize});

    return presenter.viewModel;
  }
}
