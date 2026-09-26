import {Glob} from 'bun';
import type {ScriptIo} from '../scriptIo.ts';

export interface FakeScriptIoOptions {
  files?: Record<string, string>;
  trackedFiles?: string[];
  commandLineArguments?: string[];
}

export interface FakeScriptIo {
  io: ScriptIo;
  printed: string[];
  printedErrors: string[];
  exitCodes: number[];
}

export function createFakeScriptIo({files = {}, trackedFiles = [], commandLineArguments = []}: FakeScriptIoOptions = {}): FakeScriptIo {
  const printed: string[] = [];
  const printedErrors: string[] = [];
  const exitCodes: number[] = [];

  async function* scanFiles(pattern: string): AsyncGenerator<string> {
    const glob = new Glob(pattern);
    yield* Object.keys(files).filter(filePath => glob.match(filePath));
  }

  return {
    io: {
      commandLineArguments,
      scanFiles,
      readText: async filePath => files[filePath],
      listTrackedFiles: () => trackedFiles,
      print: line => printed.push(line),
      printError: line => printedErrors.push(line),
      exit: code => exitCodes.push(code)
    },
    printed,
    printedErrors,
    exitCodes
  };
}
