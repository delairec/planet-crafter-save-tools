export interface UseCase<Request> {
  execute(request: Request): Promise<void>;
}
