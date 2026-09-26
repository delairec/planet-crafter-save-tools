import {Glob} from 'bun';

export interface ScriptIo {
  commandLineArguments: string[];
  scanFiles: (pattern: string) => AsyncIterable<string>;
  readText: (filePath: string) => Promise<string>;
  listTrackedFiles: () => string[];
  print: (line: string) => void;
  printError: (line: string) => void;
  exit: (code: number) => void;
}

function listTrackedFiles(): string[] {
  const listing = Bun.spawnSync(['git', 'ls-files', '-z']);
  if (listing.exitCode !== 0) {
    throw new Error(listing.stderr.toString());
  }
  return listing.stdout.toString().split('\0').filter(trackedFile => trackedFile !== '');
}

const PROCESS_IO: ScriptIo = {
  commandLineArguments: process.argv.slice(2),
  scanFiles: pattern => new Glob(pattern).scan({cwd: process.cwd()}),
  readText: filePath => Bun.file(filePath).text(),
  listTrackedFiles,
  print: line => console.log(line),
  printError: line => console.error(line),
  exit: code => process.exit(code)
};

export async function runAsEntryPoint(isEntryPoint: boolean, main: (io: ScriptIo) => Promise<void>): Promise<void> {
  if (isEntryPoint) {
    await main(PROCESS_IO);
  }
}
