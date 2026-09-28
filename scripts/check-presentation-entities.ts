import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {reportViolations} from './specSources.ts';
import {readImportSpecifiers} from './importSpecifiers.ts';

const SOURCE_FILES_PATTERN = 'packages/*/**/*.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;

const CHECK_NAME = 'check:presentation';

interface Refusal {
  appliesTo: RegExp;
  refusedSpecifier: RegExp;
  reason: string;
}

const PRESENTATION_DOMAIN_REFUSAL: Refusal = {
  appliesTo: /^packages\/core-[^/]+\/(?:.*\/)?presentation\//,
  refusedSpecifier: /(?:^|\/)(?:domain|infrastructure)(?:\/|$)/,
  reason: 'a presentation file reads application responses and primitives, nothing from domain/ nor infrastructure/'
};

const RESPONSE_OUTPUT_BOUNDARY_REFUSAL: Refusal = {
  appliesTo: /^packages\/core-[^/]+\/(?:.*\/)?application\/responses\//,
  refusedSpecifier: /(?:^|\/)(?:domain\/entities|infrastructure)(?:\/|$)/,
  reason: 'the output boundary hands over responses, value objects or primitives, never a domain entity nor an infrastructure type'
};

const PRESENTER_PORT_REFUSAL: Refusal = {
  appliesTo: /^packages\/core-[^/]+\/(?:.*\/)?application\/ports\/[^/]*Presenter[^/]*$/,
  refusedSpecifier: /(?:^|\/)domain(?:\/|$)/,
  reason: 'a presenter port takes application responses or primitives, nothing from domain/'
};

const CONTROLLER_PRESENTER_REFUSAL: Refusal = {
  appliesTo: /^packages\/core-[^/]+\/(?:.*\/)?controllers\//,
  refusedSpecifier: /(?:^|\/)presentation\/[^/]*Presenter$/,
  reason: 'a controller knows the view model type only: the composition root creates the presenter and hands it over with the use case'
};

export interface RefusedImport {
  line: number;
  specifier: string;
  reason: string;
}

export function findRefusedImports(filePath: string, source: string): RefusedImport[] {
  const refusal = [PRESENTATION_DOMAIN_REFUSAL, RESPONSE_OUTPUT_BOUNDARY_REFUSAL, PRESENTER_PORT_REFUSAL, CONTROLLER_PRESENTER_REFUSAL].find(candidate => candidate.appliesTo.test(filePath));
  if (refusal === undefined || GENERATED_DIRECTORY.test(filePath)) {
    return [];
  }
  return source.split('\n').flatMap((text, lineIndex) => readImportSpecifiers(text)
    .filter(specifier => refusal.refusedSpecifier.test(specifier))
    .map(specifier => ({line: lineIndex + 1, specifier, reason: refusal.reason})));
}

export async function checkPresentationFiles(io: ScriptIo): Promise<void> {
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    violations.push(...findRefusedImports(filePath, await io.readText(filePath))
      .map(({line, specifier, reason}) => `${filePath}:${line}: ${specifier}\n  ${reason}`));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no presentation file imports domain/ nor infrastructure/, no application response imports a domain entity nor infrastructure/, no presenter port imports domain/, and no controller imports a concrete presenter.',
    summarize: count => `${count} violation(s): a presentation file imports nothing from domain/ nor infrastructure/, an application response imports nothing from domain/entities nor infrastructure/, a presenter port imports nothing from domain/, and a controller imports no concrete presenter.`
  });
}

await runAsEntryPoint(import.meta.main, checkPresentationFiles);
