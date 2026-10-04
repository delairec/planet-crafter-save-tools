const CORE_PRESENTATION_ROOT_FILE = /^packages\/core-[^/]+\/(?:.*\/)?presentation\/([^/]+)$/;
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;
const PRESENTER_FILE_NAME = /Presenter(?:\.spec)?\.(?:ts|js|tsx)$/;

export function isMisplacedAtPresentationRoot(filePath: string): boolean {
  const rootFileName = CORE_PRESENTATION_ROOT_FILE.exec(filePath)?.[1];
  if (rootFileName === undefined || GENERATED_DIRECTORY.test(filePath)) {
    return false;
  }
  return !PRESENTER_FILE_NAME.test(rootFileName);
}
