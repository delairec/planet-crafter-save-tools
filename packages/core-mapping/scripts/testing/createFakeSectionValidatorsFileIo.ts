import type {SectionValidatorsFileIo} from '../sectionValidatorsFile.ts';

export interface FakeSectionValidatorsFileIo {
  io: SectionValidatorsFileIo;
  writtenSources: string[];
  printed: string[];
  printedErrors: string[];
  exitCodes: number[];
}

export function createFakeSectionValidatorsFileIo(versionedSource: string | null): FakeSectionValidatorsFileIo {
  const writtenSources: string[] = [];
  const printed: string[] = [];
  const printedErrors: string[] = [];
  const exitCodes: number[] = [];

  return {
    io: {
      readVersionedSource: async () => versionedSource,
      writeVersionedSource: async source => {
        writtenSources.push(source);
      },
      print: line => printed.push(line),
      printError: line => printedErrors.push(line),
      exit: code => exitCodes.push(code)
    },
    writtenSources,
    printed,
    printedErrors,
    exitCodes
  };
}
