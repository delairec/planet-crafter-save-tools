import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {reportViolations} from './specSources.ts';
import {applyAllowList, readAllowList} from './shrinkingAllowList.ts';

const SOURCE_FILES_PATTERN = 'packages/*/**/*.{js,ts,tsx}';
const ALLOW_LIST_PATH = 'scripts/allow-lists/presenter-ports-importing-domain.json';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;

const FROM_SPECIFIER_PATTERN = /\bfrom\s+['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_SPECIFIER_PATTERN = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

const CHECK_NAME = 'check:presentation';

interface Refusal {
  appliesTo: RegExp;
  refusedSpecifier: RegExp;
  reason: string;
}

const OUTPUT_BOUNDARY_REFUSAL: Refusal = {
  appliesTo: /^packages\/core-[^/]+\/(?:.*\/)?(?:presentation\/|application\/responses\/)/,
  refusedSpecifier: /(?:^|\/)(?:domain\/entities|infrastructure)(?:\/|$)/,
  reason: 'the output boundary hands over responses, value objects or primitives, never a domain entity nor an infrastructure type'
};

const PRESENTER_PORT_REFUSAL: Refusal = {
  appliesTo: /^packages\/core-[^/]+\/(?:.*\/)?application\/ports\/[^/]*Presenter[^/]*$/,
  refusedSpecifier: /(?:^|\/)domain(?:\/|$)/,
  reason: 'a presenter port takes application responses or primitives, nothing from domain/'
};

export interface RefusedImport {
  line: number;
  specifier: string;
  reason: string;
}

export function findRefusedImports(filePath: string, source: string): RefusedImport[] {
  const refusal = [OUTPUT_BOUNDARY_REFUSAL, PRESENTER_PORT_REFUSAL].find(candidate => candidate.appliesTo.test(filePath));
  if (refusal === undefined || GENERATED_DIRECTORY.test(filePath)) {
    return [];
  }
  return source.split('\n').flatMap((text, lineIndex) => [
    ...Array.from(text.matchAll(FROM_SPECIFIER_PATTERN), match => match[1]!),
    ...Array.from(text.matchAll(DYNAMIC_IMPORT_SPECIFIER_PATTERN), match => match[1]!)
  ]
    .filter(specifier => refusal.refusedSpecifier.test(specifier))
    .map(specifier => ({line: lineIndex + 1, specifier, reason: refusal.reason})));
}

export async function checkPresentationFiles(io: ScriptIo): Promise<void> {
  const allowList = await readAllowList(io, ALLOW_LIST_PATH);
  const outputBoundaryViolations = new Map<string, string[]>();
  const presenterPortViolations = new Map<string, string[]>();
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    const violations = findRefusedImports(filePath, await io.readText(filePath))
      .map(({line, specifier, reason}) => `${filePath}:${line}: ${specifier}\n  ${reason}`);
    if (violations.length === 0) {
      continue;
    }
    const violationsByFile = PRESENTER_PORT_REFUSAL.appliesTo.test(filePath) ? presenterPortViolations : outputBoundaryViolations;
    violationsByFile.set(filePath, violations);
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations: [
      ...[...outputBoundaryViolations.values()].flat(),
      ...applyAllowList(allowList, presenterPortViolations)
    ],
    nothingFound: 'no domain entity nor infrastructure type crosses the output boundary, and no presenter port outside the allow-list imports domain/.',
    summarize: count => `${count} violation(s): a presentation file or an application response imports nothing from domain/entities nor infrastructure/, and a presenter port imports nothing from domain/.`
  });
}

await runAsEntryPoint(import.meta.main, checkPresentationFiles);
