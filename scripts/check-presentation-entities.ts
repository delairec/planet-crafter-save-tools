import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {reportViolations} from './specSources.ts';

const SOURCE_FILES_PATTERN = 'packages/*/**/*.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;
const PRESENTATION_DIRECTORY = /(?:^|\/)presentation\//;

const FROM_SPECIFIER_PATTERN = /\bfrom\s+['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_SPECIFIER_PATTERN = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const DOMAIN_ENTITIES_SPECIFIER = /(?:^|\/)domain\/entities\//;

const CHECK_NAME = 'check:presentation';
const VIOLATION_REASON = 'a presenter takes a value object, never a domain entity';

export interface EntityImport {
  line: number;
  specifier: string;
}

/**
 * @param {string} filePath a source file path relative to the repository root
 * @returns whether the layer rule applies to that file
 */
export function isPresentationFile(filePath: string): boolean {
  return PRESENTATION_DIRECTORY.test(filePath) && !GENERATED_DIRECTORY.test(filePath);
}

/**
 * @param {string} source the whole content of a source file
 * @returns every domain entity module the file imports, in file order
 */
export function findEntityImports(source: string): EntityImport[] {
  return source.split('\n').flatMap((text, lineIndex) => [
    ...Array.from(text.matchAll(FROM_SPECIFIER_PATTERN), match => match[1]!),
    ...Array.from(text.matchAll(DYNAMIC_IMPORT_SPECIFIER_PATTERN), match => match[1]!)
  ]
    .filter(specifier => DOMAIN_ENTITIES_SPECIFIER.test(specifier))
    .map(specifier => ({line: lineIndex + 1, specifier})));
}

export async function checkPresentationFiles(io: ScriptIo): Promise<void> {
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    if (!isPresentationFile(filePath)) {
      continue;
    }
    findEntityImports(await io.readText(filePath))
      .forEach(({line, specifier}) => violations.push(`${filePath}:${line}: ${specifier}\n  ${VIOLATION_REASON}`));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no domain entity reaches a presentation layer.',
    summarize: count => `${count} domain entity import(s) in a presentation layer.`
  });
}

await runAsEntryPoint(import.meta.main, checkPresentationFiles);
