export interface UseCase<Request> {
  execute(request: Request): Promise<void>;
}

export type UseCaseFactory<PresenterPort, Request> = (presenter: PresenterPort) => UseCase<Request>;
