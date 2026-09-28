import {UseCase} from "../application/UseCase";

export interface UseCaseWithPresenter<Request, ViewModel> {
  readonly useCase: UseCase<Request>;
  readonly presenter: {readonly viewModel: ViewModel};
}

export type UseCaseFactory<Request, ViewModel> = () => UseCaseWithPresenter<Request, ViewModel>;
