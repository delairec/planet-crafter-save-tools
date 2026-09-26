export interface SectionValidatorsFileIo {
  readVersionedSource: () => Promise<string | null>;
  writeVersionedSource: (source: string) => Promise<void>;
  print: (line: string) => void;
  printError: (line: string) => void;
  exit: (code: number) => void;
}

export const SECTION_VALIDATORS_PATH = new URL('../src/infrastructure/sectionValidators.generated.js', import.meta.url).pathname;

const PROCESS_IO: SectionValidatorsFileIo = {
  readVersionedSource: async () => {
    const versionedFile = Bun.file(SECTION_VALIDATORS_PATH);
    return await versionedFile.exists() ? versionedFile.text() : null;
  },
  writeVersionedSource: async source => {
    await Bun.write(SECTION_VALIDATORS_PATH, source);
  },
  print: line => console.log(line),
  printError: line => console.error(line),
  exit: code => process.exit(code)
};

export async function runAsEntryPoint(isEntryPoint: boolean, main: (io: SectionValidatorsFileIo) => Promise<void>): Promise<void> {
  if (isEntryPoint) {
    await main(PROCESS_IO);
  }
}
