import {UseCase} from "../application/UseCase";

export type UseCaseFactory<PresenterPort, Request> = (presenter: PresenterPort) => UseCase<Request>;
