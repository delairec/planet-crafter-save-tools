import {runAsEntryPoint, type ScriptIo} from '../../common/scriptIo.ts';
import {readImportStatements, type ImportStatement} from '../common/readImportStatements.ts';
import {isOwnSourceFile, reportViolations} from '../common/specSources.ts';
import {readWorkspacePackageNames} from '../common/readWorkspacePackageNames.ts';

const SOURCE_FILES_PATTERN = 'packages/core-*/**/*.{js,ts,tsx}';
const CORE_PACKAGE_FILE = /^packages\/core-[^/]+\//;
const INFRASTRUCTURE_FILE = /^packages\/core-[^/]+\/(?:.*\/)?infrastructure\//;

const CHECK_NAME = 'check:workspace-imports';
const REASON = 'outside infrastructure/, no file of a core- package imports another workspace package, a type, a spec file and a test-support file included: declare the type in the application or the domain, and let an infrastructure adapter map the other package onto it';

function namesWorkspacePackage(specifier: string, workspacePackageNames: ReadonlySet<string>): boolean {
  return workspacePackageNames.has(specifier.split('/')[0]!);
}

function isGuardedFile(filePath: string): boolean {
  return CORE_PACKAGE_FILE.test(filePath) && !INFRASTRUCTURE_FILE.test(filePath) && isOwnSourceFile(filePath);
}

export function findWorkspacePackageImports(filePath: string, source: string, workspacePackageNames: ReadonlySet<string>): ImportStatement[] {
  if (!isGuardedFile(filePath)) {
    return [];
  }
  return readImportStatements(source).filter(({specifier}) => namesWorkspacePackage(specifier, workspacePackageNames));
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
