import {posix} from 'node:path';
import {runAsEntryPoint, type ScriptIo} from '../../common/scriptIo.ts';
import {reportViolations} from '../common/specSources.ts';
import {readImportSpecifiers} from '../common/importSpecifiers.ts';
import {isMisplacedAtPresentationRoot} from './isMisplacedAtPresentationRoot.ts';

const SOURCE_FILES_PATTERN = 'packages/*/**/*.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;
const PRESENTER_FILE = /(?:^|\/)presentation\/(?:.*\/)?[^/]*Presenter(?:\.spec)?\.(?:ts|js|tsx)$/;
const MAPPER_FOLDER = /(?:^|\/)presentation\/mappers\//;

const CHECK_NAME = 'check:presentation';
const MISPLACED_MODULE_REASON = 'the root of a presentation folder holds presenters only, with their specs: every other module sits in a subfolder, a mapper under mappers/';

interface ReviewedImport {
  filePath: string;
  specifier: string;
}

interface Refusal {
  appliesTo: (filePath: string) => boolean;
  refuses: (reviewedImport: ReviewedImport) => boolean;
  reason: string;
}

const PRESENTATION_DOMAIN_REFUSAL: Refusal = {
  appliesTo: filePath => /^packages\/core-[^/]+\/(?:.*\/)?presentation\//.test(filePath),
  refuses: ({specifier}) => /(?:^|\/)(?:domain|infrastructure)(?:\/|$)/.test(specifier),
  reason: 'a presentation file reads application responses and primitives, nothing from domain/ nor infrastructure/'
};

const RESPONSE_OUTPUT_BOUNDARY_REFUSAL: Refusal = {
  appliesTo: filePath => /^packages\/core-[^/]+\/(?:.*\/)?application\/responses\//.test(filePath),
  refuses: ({specifier}) => /(?:^|\/)(?:domain\/entities|infrastructure)(?:\/|$)/.test(specifier),
  reason: 'the output boundary hands over responses, value objects or primitives, never a domain entity nor an infrastructure type'
};

const PRESENTER_PORT_REFUSAL: Refusal = {
  appliesTo: filePath => /^packages\/core-[^/]+\/(?:.*\/)?application\/ports\/[^/]*Presenter[^/]*$/.test(filePath),
  refuses: ({specifier}) => /(?:^|\/)domain(?:\/|$)/.test(specifier),
  reason: 'a presenter port takes application responses or primitives, nothing from domain/'
};

const CONTROLLER_PRESENTER_REFUSAL: Refusal = {
  appliesTo: filePath => /^packages\/core-[^/]+\/(?:.*\/)?controllers\//.test(filePath),
  refuses: ({specifier}) => /(?:^|\/)presentation\/[^/]*Presenter$/.test(specifier),
  reason: 'a controller knows the view model type only: the composition root creates the presenter and hands it over with the use case'
};

function resolveImportTarget({filePath, specifier}: ReviewedImport): string {
  return specifier.startsWith('.') ? posix.resolve('/', posix.dirname(filePath), specifier) : specifier;
}

const MAPPER_REFUSAL: Refusal = {
  appliesTo: filePath => filePath.startsWith('packages/') && !PRESENTER_FILE.test(filePath) && !MAPPER_FOLDER.test(filePath),
  refuses: reviewedImport => MAPPER_FOLDER.test(resolveImportTarget(reviewedImport)),
  reason: 'a mapper is imported by a presenter, another mapper or the spec of either only: never by a view model, a messages file, a use case, a controller nor any other module'
};

const REFUSALS = [PRESENTATION_DOMAIN_REFUSAL, RESPONSE_OUTPUT_BOUNDARY_REFUSAL, PRESENTER_PORT_REFUSAL, CONTROLLER_PRESENTER_REFUSAL, MAPPER_REFUSAL];

export interface RefusedImport {
  line: number;
  specifier: string;
  reason: string;
}

export function findRefusedImports(filePath: string, source: string): RefusedImport[] {
  const applicableRefusals = REFUSALS.filter(refusal => refusal.appliesTo(filePath));
  if (applicableRefusals.length === 0 || GENERATED_DIRECTORY.test(filePath)) {
    return [];
  }
  return source.split('\n').flatMap((text, lineIndex) => readImportSpecifiers(text)
    .flatMap(specifier => applicableRefusals
      .filter(refusal => refusal.refuses({filePath, specifier}))
      .map(refusal => ({line: lineIndex + 1, specifier, reason: refusal.reason}))));
}

function describeViolations(filePath: string, source: string): string[] {
  const placementViolations = isMisplacedAtPresentationRoot(filePath) ? [`${filePath}\n  ${MISPLACED_MODULE_REASON}`] : [];
  const importViolations = findRefusedImports(filePath, source)
    .map(({line, specifier, reason}) => `${filePath}:${line}: ${specifier}\n  ${reason}`);
  return [...placementViolations, ...importViolations];
}

export async function checkPresentationFiles(io: ScriptIo): Promise<void> {
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    violations.push(...describeViolations(filePath, await io.readText(filePath)));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no presentation file imports domain/ nor infrastructure/, no application response imports a domain entity nor infrastructure/, no presenter port imports domain/, no controller imports a concrete presenter, the root of every presentation folder holds presenters only, and no module but a presenter, a mapper or the spec of either imports a mapper.',
    summarize: count => `${count} violation(s): a presentation file imports nothing from domain/ nor infrastructure/, an application response imports nothing from domain/entities nor infrastructure/, a presenter port imports nothing from domain/, a controller imports no concrete presenter, the root of a presentation folder holds presenters only, and a mapper is imported by a presenter, another mapper or the spec of either only.`
  });
}

await runAsEntryPoint(import.meta.main, checkPresentationFiles);
