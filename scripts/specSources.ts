import type {ScriptIo} from './scriptIo.ts';

const SPEC_FILES_PATTERN = '**/*.spec.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage)\//;
const STRING_LITERAL = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g;

/**
 * Replaces the content of every string literal with filler of the same length, so that a form
 * quoted in a message, or the brackets and operators written inside a literal, are not read as code.
 * @param {string} line
 */
export function maskStringLiterals(line: string): string {
  return line.replace(STRING_LITERAL, literal => '_'.repeat(literal.length));
}

/**
 * @param {string} filePath a source file path relative to the repository root
 * @returns whether that file is one of ours, wherever it lives in the repository
 */
export function isOwnSourceFile(filePath: string): boolean {
  return !GENERATED_DIRECTORY.test(filePath);
}

/**
 * @param {ScriptIo} io the file system the files are read from
 * @param {string} pattern a glob matched against the repository, from its root
 * @returns the path and the content of every file it matches, generated ones excluded
 */
export async function* readOwnSourceFiles(io: ScriptIo, pattern: string): AsyncGenerator<{filePath: string, source: string}> {
  for await (const filePath of io.scanFiles(pattern)) {
    if (!isOwnSourceFile(filePath)) {
      continue;
    }
    yield {filePath, source: await io.readText(filePath)};
  }
}

/**
 * @param {ScriptIo} io the file system the files are read from
 * @returns the path and the content of every spec file of the repository, generated ones excluded
 */
export function readOwnSpecFiles(io: ScriptIo): AsyncGenerator<{filePath: string, source: string}> {
  return readOwnSourceFiles(io, SPEC_FILES_PATTERN);
}

export interface ViolationReport {
  /** the npm script name, as the reader will type it again */
  checkName: string;
  /** one entry per offending line, already formatted */
  violations: string[];
  /** the sentence printed when the repository respects the rule */
  nothingFound: string;
  /** the sentence printed when it does not */
  summarize: (count: number) => string;
}

/**
 * Prints what a guard found and exits with the code it must return: the report is the whole
 * user interface of a guard, so every check states its outcome the same way.
 * @param {ScriptIo} io the console the report is printed on and the exit the code is given to
 * @param {ViolationReport} report
 */
export function reportViolations(io: ScriptIo, {checkName, violations, nothingFound, summarize}: ViolationReport): void {
  if (violations.length === 0) {
    io.print(`${checkName}: ${nothingFound}`);
    io.exit(0);
    return;
  }
  violations.forEach(violation => io.print(violation));
  io.print(`${checkName}: ${summarize(violations.length)}`);
  io.exit(1);
}
