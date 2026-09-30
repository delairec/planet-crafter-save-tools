import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {isOwnSourceFile, reportViolations} from './specSources.ts';

const SOURCE_FILES_PATTERN = 'packages/core-*/**/*.{js,ts,tsx}';
const MANIFEST_FILES_PATTERN = 'packages/*/package.json';
const INNER_LAYER_FILE = /^packages\/core-[^/]+\/(?:.*\/)?(?:domain|application)\//;

const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const LINE_COMMENT = /^\s*\/\/.*$/gm;
const STATIC_STATEMENT = /^[ \t]*(?:import|export)\b(\s+type\b)?[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/gm;
const SIDE_EFFECT_IMPORT = /^[ \t]*import\s*['"]([^'"]+)['"]/gm;
const DYNAMIC_IMPORT = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;

const CHECK_NAME = 'check:runtime-imports';
const REASON = 'domain/ and application/ of a core- package take only types from another workspace package: write import type, or reach the capability through a port';

export interface RuntimeImportFinding {
  line: number;
  specifier: string;
}

interface ImportStatement {
  offset: number;
  specifier: string;
  typeOnly: boolean;
}

function blankComment(comment: string): string {
  return comment.replace(/[^\n]/g, ' ');
}

function stripComments(source: string): string {
  return source.replace(BLOCK_COMMENT, blankComment).replace(LINE_COMMENT, blankComment);
}

function readImportStatements(code: string): ImportStatement[] {
  return [
    ...Array.from(code.matchAll(STATIC_STATEMENT), match => ({offset: match.index, specifier: match[2]!, typeOnly: match[1] !== undefined})),
    ...Array.from(code.matchAll(SIDE_EFFECT_IMPORT), match => ({offset: match.index, specifier: match[1]!, typeOnly: false})),
    ...Array.from(code.matchAll(DYNAMIC_IMPORT), match => ({offset: match.index, specifier: match[1]!, typeOnly: false}))
  ];
}

function namesWorkspacePackage(specifier: string, workspacePackageNames: ReadonlySet<string>): boolean {
  return workspacePackageNames.has(specifier.split('/')[0]!);
}

function countLine(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length;
}

export function findRuntimeImports(filePath: string, source: string, workspacePackageNames: ReadonlySet<string>): RuntimeImportFinding[] {
  if (!INNER_LAYER_FILE.test(filePath) || !isOwnSourceFile(filePath)) {
    return [];
  }
  const code = stripComments(source);
  return readImportStatements(code)
    .filter(({specifier, typeOnly}) => !typeOnly && namesWorkspacePackage(specifier, workspacePackageNames))
    .sort((left, right) => left.offset - right.offset)
    .map(({offset, specifier}) => ({line: countLine(code, offset), specifier}));
}

async function readWorkspacePackageNames(io: ScriptIo): Promise<Set<string>> {
  const names = new Set<string>();
  for await (const manifestPath of io.scanFiles(MANIFEST_FILES_PATTERN)) {
    const {name} = JSON.parse(await io.readText(manifestPath)) as {name: string};
    names.add(name);
  }
  return names;
}

export async function checkCoreRuntimeImports(io: ScriptIo): Promise<void> {
  const workspacePackageNames = await readWorkspacePackageNames(io);
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    const findings = findRuntimeImports(filePath, await io.readText(filePath), workspacePackageNames);
    violations.push(...findings.map(({line, specifier}) => `${filePath}:${line}: ${specifier}\n  ${REASON}`));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no file under domain/ or application/ of a core- package imports runtime code of another workspace package.',
    summarize: count => `${count} violation(s): only import type crosses from another workspace package into domain/ or application/ of a core- package.`
  });
}

await runAsEntryPoint(import.meta.main, checkCoreRuntimeImports);
