import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {reportViolations} from './specSources.ts';

const PACKAGE_FILES_PATTERN = 'packages/**';
const PACKAGE_FILE = /^packages\/[^/]+\//;
const SCRIPT_EXTENSION = /\.(?:jsx?|tsx?|[cm][jt]s)$/;
const SPEC_OR_TEST_FILE = /\.(?:spec|test)\.[^/]+$/;
const TEST_SUPPORT_DIRECTORY = /(?:^|\/)(?:e2e|testing)\//;
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;

const COMMENT_OR_STRING_LITERAL = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\[\s\S]|[^`\\])*`/g;
const MASKED_CHARACTER = /[^\n]/g;
const JSON_PARSE_CALL = /\bJSON\s*\.\s*parse\b/;

const ADMITTED_PARSER_MODULE = 'packages/shared-save-processing/parseSaveSections.js';
const UNADMITTED_CALL_REASON = `a save line reaches JSON.parse through ${ADMITTED_PARSER_MODULE} alone; parse through parseSaveSections instead`;

const CHECK_NAME = 'check:save-line-reader';

export interface ProductionSource {
  filePath: string;
  source: string;
}

export function isProductionSourceFile(filePath: string): boolean {
  return PACKAGE_FILE.test(filePath)
    && SCRIPT_EXTENSION.test(filePath)
    && !SPEC_OR_TEST_FILE.test(filePath)
    && !TEST_SUPPORT_DIRECTORY.test(filePath)
    && !GENERATED_DIRECTORY.test(filePath);
}

function maskCommentsAndStringLiterals(source: string): string {
  return source.replace(COMMENT_OR_STRING_LITERAL, masked => masked.replace(MASKED_CHARACTER, '_'));
}

export function findUnadmittedJsonParseCalls({filePath, source}: ProductionSource): number[] {
  if (filePath === ADMITTED_PARSER_MODULE) {
    return [];
  }
  return maskCommentsAndStringLiterals(source)
    .split('\n')
    .flatMap((code, lineIndex) => JSON_PARSE_CALL.test(code) ? [lineIndex + 1] : []);
}

export async function checkSaveLineReader(io: ScriptIo): Promise<void> {
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(PACKAGE_FILES_PATTERN)) {
    if (!isProductionSourceFile(filePath)) {
      continue;
    }
    findUnadmittedJsonParseCalls({filePath, source: await io.readText(filePath)})
      .forEach(line => violations.push(`${filePath}:${line}\n  ${UNADMITTED_CALL_REASON}`));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: `no production module calls JSON.parse outside ${ADMITTED_PARSER_MODULE}.`,
    summarize: count => `${count} JSON.parse call(s) outside ${ADMITTED_PARSER_MODULE}.`
  });
}

await runAsEntryPoint(import.meta.main, checkSaveLineReader);
