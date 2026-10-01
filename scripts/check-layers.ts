import {posix} from 'node:path';
import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {readImportStatements, type ImportStatement} from './readImportStatements.ts';
import {reportViolations} from './specSources.ts';
import {readWorkspacePackageNames} from './readWorkspacePackageNames.ts';
import {findRefusedImports} from './check-presentation-entities.ts';
import {findWorkspacePackageImports} from './check-workspace-imports.ts';

const SOURCE_FILES_PATTERN = 'packages/core-*/src/**/*.{js,ts,tsx}';
const CORE_SOURCE_FILE = /^packages\/core-[^/]+\/src\//;
const SPEC_FILE = /\.spec\.(?:js|ts|tsx)$/;
const TEST_SUPPORT_FOLDER = 'testing';
const JSON_TABLE = /\.json$/;

const LAYERS = ['domain', 'application', 'infrastructure', 'presentation', 'controllers', 'composition'] as const;
type Layer = typeof LAYERS[number];

const APPLICATION_CONTRACT_FOLDERS = new Set(['ports', 'requests', 'responses']);

interface LayerRule {
  allowedLayers: readonly Layer[];
  applicationContractsOnly: boolean;
  reason: string;
}

const LAYER_RULES: Partial<Record<Layer, LayerRule>> = {
  domain: {
    allowedLayers: ['domain'],
    applicationContractsOnly: false,
    reason: 'a domain file imports the domain only: the domain depends on nothing'
  },
  application: {
    allowedLayers: ['application', 'domain'],
    applicationContractsOnly: false,
    reason: 'an application file imports the application and the domain only: never infrastructure, presentation, controllers nor composition'
  },
  infrastructure: {
    allowedLayers: ['infrastructure', 'application', 'domain'],
    applicationContractsOnly: false,
    reason: 'an infrastructure file imports the infrastructure, the application and the domain only: never presentation, controllers nor composition'
  },
  presentation: {
    allowedLayers: ['presentation', 'application'],
    applicationContractsOnly: true,
    reason: 'a presentation file imports the presentation and the application contracts it transforms outcomes with (application/ports, application/requests, application/responses) only: never a use case, controllers nor composition'
  },
  controllers: {
    allowedLayers: ['controllers', 'application', 'presentation'],
    applicationContractsOnly: false,
    reason: 'a controller imports controllers, the application and the presentation only: never domain, infrastructure nor composition'
  }
};

const NO_LAYER_REASON = `a production file of a core- package lies in a layer folder (${LAYERS.join(', ')}), where the dependency rule can judge it`;
const TEST_SUPPORT_REASON = 'no production file imports a file under testing/: test support is never imported by production runtime code';
const EXTERNAL_REASON = 'outside infrastructure/, a production file imports relative source files only: a runtime module or a package is reached through a port an infrastructure adapter implements';
const JSON_TABLE_REASON = 'outside infrastructure/, no production file imports a JSON table: a value table is a database, read by an infrastructure adapter behind a port';

const CHECK_NAME = 'check:layers';
const NOTHING_FOUND = 'every production file of a core- package lies in a layer and imports only the layers the dependency rule allows it, no file under testing/, and outside infrastructure/ relative source files only.';
const SUMMARY = 'a production file of a core- package lies in a layer and imports only the layers the dependency rule allows it, no file under testing/, and outside infrastructure/ no runtime module, package nor JSON table.';

export interface ImportViolation {
  line: number;
  specifier: string;
  reason: string;
}

export interface FileViolation {
  reason: string;
}

export type LayerViolation = ImportViolation | FileViolation;

interface ImportingFile {
  path: string;
  layer: Layer | undefined;
}

function isLayer(segment: string): segment is Layer {
  return (LAYERS as readonly string[]).includes(segment);
}

function findLayer(path: string): Layer | undefined {
  return path.split('/').find(isLayer);
}

function isTestSupport(path: string): boolean {
  return path.split('/').includes(TEST_SUPPORT_FOLDER);
}

function isProductionSource(filePath: string): boolean {
  return CORE_SOURCE_FILE.test(filePath) && !SPEC_FILE.test(filePath) && !isTestSupport(filePath);
}

function isRelative(specifier: string): boolean {
  return specifier.startsWith('./') || specifier.startsWith('../');
}

function isApplicationContract(target: string): boolean {
  const segments = target.split('/');
  const folder = segments[segments.indexOf('application') + 1];
  return folder !== undefined && APPLICATION_CONTRACT_FOLDERS.has(folder);
}

function isAllowedTarget(rule: LayerRule, target: string): boolean {
  const targetLayer = findLayer(target);
  if (targetLayer === undefined) {
    return true;
  }
  if (!rule.allowedLayers.includes(targetLayer)) {
    return false;
  }
  return targetLayer !== 'application' || !rule.applicationContractsOnly || isApplicationContract(target);
}

function judgeRelativeImport(file: ImportingFile, specifier: string): string | undefined {
  const target = posix.resolve('/', posix.dirname(file.path), specifier);
  if (isTestSupport(target)) {
    return TEST_SUPPORT_REASON;
  }
  if (file.layer !== 'infrastructure' && JSON_TABLE.test(specifier)) {
    return JSON_TABLE_REASON;
  }
  const rule = file.layer === undefined ? undefined : LAYER_RULES[file.layer];
  if (rule !== undefined && !isAllowedTarget(rule, target)) {
    return rule.reason;
  }
  return undefined;
}

function judgeImport(file: ImportingFile, specifier: string): string | undefined {
  if (isRelative(specifier)) {
    return judgeRelativeImport(file, specifier);
  }
  return file.layer === 'infrastructure' ? undefined : EXTERNAL_REASON;
}

function readSpecifiersOtherGuardsRefuse(filePath: string, source: string, workspacePackageNames: ReadonlySet<string>): Set<string> {
  return new Set([
    ...findRefusedImports(filePath, source),
    ...findWorkspacePackageImports(filePath, source, workspacePackageNames)
  ].map(({specifier}) => specifier));
}

function judgeImports(file: ImportingFile, imports: ImportStatement[]): ImportViolation[] {
  return imports.flatMap(({line, specifier}) => {
    const reason = judgeImport(file, specifier);
    return reason === undefined ? [] : [{line, specifier, reason}];
  });
}

export function findLayerViolations(filePath: string, source: string, workspacePackageNames: ReadonlySet<string>): LayerViolation[] {
  if (!isProductionSource(filePath)) {
    return [];
  }
  const file: ImportingFile = {path: filePath, layer: findLayer(filePath)};
  const leftToOtherGuards = readSpecifiersOtherGuardsRefuse(filePath, source, workspacePackageNames);
  const importViolations = judgeImports(file, readImportStatements(source).filter(({specifier}) => !leftToOtherGuards.has(specifier)));
  return file.layer === undefined ? [{reason: NO_LAYER_REASON}, ...importViolations] : importViolations;
}

function formatViolation(filePath: string, violation: LayerViolation): string {
  return 'specifier' in violation
    ? `${filePath}:${violation.line}: ${violation.specifier}\n  ${violation.reason}`
    : `${filePath}\n  ${violation.reason}`;
}

export async function checkLayers(io: ScriptIo): Promise<void> {
  const workspacePackageNames = await readWorkspacePackageNames(io);
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    const findings = findLayerViolations(filePath, await io.readText(filePath), workspacePackageNames);
    violations.push(...findings.map(violation => formatViolation(filePath, violation)));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: NOTHING_FOUND,
    summarize: count => `${count} violation(s): ${SUMMARY}`
  });
}

await runAsEntryPoint(import.meta.main, checkLayers);
