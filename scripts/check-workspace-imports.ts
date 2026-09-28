import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {isOwnSourceFile, reportViolations} from './specSources.ts';

const SOURCE_FILES_PATTERN = 'packages/core-*/**/*.{js,ts,tsx}';
const MANIFEST_FILES_PATTERN = 'packages/*/package.json';
const CORE_PACKAGE_FILE = /^packages\/core-[^/]+\//;
const INFRASTRUCTURE_FILE = /^packages\/core-[^/]+\/(?:.*\/)?infrastructure\//;

const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const LINE_COMMENT = /^\s*\/\/.*$/gm;
const STATIC_STATEMENT = /^[ \t]*(?:import|export)\b[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/gm;
const SIDE_EFFECT_IMPORT = /^[ \t]*import\s*['"]([^'"]+)['"]/gm;
const DYNAMIC_IMPORT = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const JSDOC_IMPORT = /@import\b[^'"]*?\bfrom\s*['"]([^'"]+)['"]/g;

const CHECK_NAME = 'check:workspace-imports';
const REASON = 'outside infrastructure/, no file of a core- package imports another workspace package, a type, a spec file and a test-support file included: declare the type in the application or the domain, and let an infrastructure adapter map the other package onto it';

export interface WorkspaceImportFinding {
  line: number;
  specifier: string;
}

interface ImportStatement {
  offset: number;
  specifier: string;
}

function blankComment(comment: string): string {
  return comment.replace(/[^\n]/g, ' ');
}

function stripComments(source: string): string {
  return source.replace(BLOCK_COMMENT, blankComment).replace(LINE_COMMENT, blankComment);
}

function readComments(source: string): string {
  const code = stripComments(source);
  return Array.from(source, (character, offset) => character === code[offset] && character !== '\n' ? ' ' : character).join('');
}

function matchSpecifiers(text: string, pattern: RegExp): ImportStatement[] {
  return Array.from(text.matchAll(pattern), match => ({offset: match.index, specifier: match[1]!}));
}

function readImportStatements(source: string): ImportStatement[] {
  const code = stripComments(source);
  const comments = readComments(source);
  return [
    ...matchSpecifiers(code, STATIC_STATEMENT),
    ...matchSpecifiers(code, SIDE_EFFECT_IMPORT),
    ...matchSpecifiers(code, DYNAMIC_IMPORT),
    ...matchSpecifiers(comments, JSDOC_IMPORT),
    ...matchSpecifiers(comments, DYNAMIC_IMPORT)
  ];
}

function namesWorkspacePackage(specifier: string, workspacePackageNames: ReadonlySet<string>): boolean {
  return workspacePackageNames.has(specifier.split('/')[0]!);
}

function countLine(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length;
}

function isGuardedFile(filePath: string): boolean {
  return CORE_PACKAGE_FILE.test(filePath) && !INFRASTRUCTURE_FILE.test(filePath) && isOwnSourceFile(filePath);
}

export function findWorkspacePackageImports(filePath: string, source: string, workspacePackageNames: ReadonlySet<string>): WorkspaceImportFinding[] {
  if (!isGuardedFile(filePath)) {
    return [];
  }
  return readImportStatements(source)
    .filter(({specifier}) => namesWorkspacePackage(specifier, workspacePackageNames))
    .sort((left, right) => left.offset - right.offset)
    .map(({offset, specifier}) => ({line: countLine(source, offset), specifier}));
}

async function readWorkspacePackageNames(io: ScriptIo): Promise<Set<string>> {
  const names = new Set<string>();
  for await (const manifestPath of io.scanFiles(MANIFEST_FILES_PATTERN)) {
    const {name} = JSON.parse(await io.readText(manifestPath)) as {name: string};
    names.add(name);
  }
  return names;
}

export async function checkWorkspaceImports(io: ScriptIo): Promise<void> {
  const workspacePackageNames = await readWorkspacePackageNames(io);
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    const findings = findWorkspacePackageImports(filePath, await io.readText(filePath), workspacePackageNames);
    violations.push(...findings.map(({line, specifier}) => `${filePath}:${line}: ${specifier}\n  ${REASON}`));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no file of a core- package outside infrastructure/ imports another workspace package, spec files and testing/ included.',
    summarize: count => `${count} violation(s): outside infrastructure/, a file of a core- package imports no other workspace package, a type, a spec file and a test-support file included.`
  });
}

await runAsEntryPoint(import.meta.main, checkWorkspaceImports);
