import {posix} from 'node:path';
import {runAsEntryPoint, type ScriptIo} from '../../common/scriptIo.ts';
import {readImportStatements, type ImportStatement} from '../common/readImportStatements.ts';
import {reportViolations} from '../common/specSources.ts';

const SOURCE_FILES_PATTERN = 'packages/core-*/src/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}';
const PACKAGE_SOURCE_FILE = /^(packages\/core-[^/]+)\/src\/(.+)$/;
const SOURCE_FILE_EXTENSION = /\.(?:js|jsx|ts|tsx|mjs|cjs|mts|cts)$/;
const SHARED_AREA = 'save';
const IMPORT_MAP_PREFIX = '#';

const CHECK_NAME = 'check:business-boundaries';
const BUSINESS_REASON = 'a file of a business imports no file of another business, a spec file and a test-support file included: move what both businesses need into the shared area save/, or keep it in the business that uses it';
const SHARED_REASON = 'a file of the shared area save/ imports no file of a business, a spec file and a test-support file included: move what the shared area needs into save/, or keep the code that needs the business in that business';
const OUTSIDE_AREAS_REASON = 'a file of an area reaches the files of its package by a relative path to a file of an area under src/ only, never a file directly under src/ nor a path leaving src/ (the package root, node_modules, another package): import the file from the area that holds it';
const SELF_REFERENCE_REASON = 'a file of an area imports no file of its own package by the package name or by an entry of its import map: import it by a relative path inside src/';
const ROOT_FILE_REASON = 'in a core- package laid out by business, every file under src/ lives in an area, so that no file bridges two businesses: move this file into the business that uses it, or into the shared area save/';
const NOTHING_FOUND = 'in every core- package laid out by business, one holding the shared area src/save/, every file under src/ lives in an area, no business imports another business nor the shared area a business, and every import of a file of the package is a relative path inside src/, spec files and testing/ included.';
const SUMMARY = 'in a core- package laid out by business, one holding the shared area src/save/, every file under src/ lives in an area, a business imports no other business and the shared area no business, and a file of the package is imported by a relative path inside src/ only, a spec file and a test-support file included.';

export interface BusinessBoundaryViolation {
  reason: string;
  importStatement?: ImportStatement;
}

interface ImportingFile {
  filePath: string;
  packageDirectory: string;
  packageName: string;
  area: string;
}

function isPath(specifier: string): boolean {
  return specifier === '.' || specifier === '..' || specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('/');
}

function findTargetArea(importingFile: ImportingFile, specifier: string): string | undefined {
  if (specifier.startsWith('/')) {
    return undefined;
  }
  const target = posix.resolve('/', posix.dirname(importingFile.filePath), specifier);
  const packageSource = `/${importingFile.packageDirectory}/src/`;
  if (!target.startsWith(packageSource)) {
    return undefined;
  }
  const [targetArea, ...rest] = target.slice(packageSource.length).split('/');
  if (rest.length === 0 && SOURCE_FILE_EXTENSION.test(targetArea)) {
    return undefined;
  }
  return targetArea;
}

function judgePathImport(importingFile: ImportingFile, specifier: string): string | undefined {
  const targetArea = findTargetArea(importingFile, specifier);
  if (targetArea === undefined) {
    return OUTSIDE_AREAS_REASON;
  }
  if (targetArea === importingFile.area || targetArea === SHARED_AREA) {
    return undefined;
  }
  return importingFile.area === SHARED_AREA ? SHARED_REASON : BUSINESS_REASON;
}

function judgePackageImport({packageName}: ImportingFile, specifier: string): string | undefined {
  const namesOwnPackage = specifier === packageName || specifier.startsWith(`${packageName}/`) || specifier.startsWith(IMPORT_MAP_PREFIX);
  return namesOwnPackage ? SELF_REFERENCE_REASON : undefined;
}

function judgeImport(importingFile: ImportingFile, specifier: string): string | undefined {
  return isPath(specifier) ? judgePathImport(importingFile, specifier) : judgePackageImport(importingFile, specifier);
}

export function findBusinessBoundaryViolations(filePath: string, source: string, businessPackages: ReadonlyMap<string, string>): BusinessBoundaryViolation[] {
  const match = PACKAGE_SOURCE_FILE.exec(filePath);
  if (!match) {
    return [];
  }
  const [, packageDirectory, pathInSource] = match;
  const packageName = businessPackages.get(packageDirectory);
  if (packageName === undefined) {
    return [];
  }
  if (!pathInSource.includes('/')) {
    return [{reason: ROOT_FILE_REASON}];
  }
  const importingFile: ImportingFile = {filePath, packageDirectory, packageName, area: pathInSource.split('/')[0]};
  return readImportStatements(source).flatMap(importStatement => {
    const reason = judgeImport(importingFile, importStatement.specifier);
    return reason === undefined ? [] : [{importStatement, reason}];
  });
}

async function scanSourceFiles(io: ScriptIo): Promise<string[]> {
  const filePaths: string[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    filePaths.push(filePath);
  }
  return filePaths;
}

function findBusinessPackageDirectories(filePaths: string[]): Set<string> {
  const directories = new Set<string>();
  for (const filePath of filePaths) {
    const match = PACKAGE_SOURCE_FILE.exec(filePath);
    if (match?.[2].startsWith(`${SHARED_AREA}/`)) {
      directories.add(match[1]);
    }
  }
  return directories;
}

async function readBusinessPackages(io: ScriptIo, filePaths: string[]): Promise<Map<string, string>> {
  const businessPackages = new Map<string, string>();
  for (const directory of findBusinessPackageDirectories(filePaths)) {
    const {name} = JSON.parse(await io.readText(`${directory}/package.json`)) as {name: string};
    businessPackages.set(directory, name);
  }
  return businessPackages;
}

function formatViolation(filePath: string, {reason, importStatement}: BusinessBoundaryViolation): string {
  if (importStatement === undefined) {
    return `${filePath}\n  ${reason}`;
  }
  return `${filePath}:${importStatement.line}: ${importStatement.specifier}\n  ${reason}`;
}

export async function checkBusinessBoundaries(io: ScriptIo): Promise<void> {
  const filePaths = await scanSourceFiles(io);
  const businessPackages = await readBusinessPackages(io, filePaths);
  const violations: string[] = [];
  for (const filePath of filePaths) {
    const findings = findBusinessBoundaryViolations(filePath, await io.readText(filePath), businessPackages);
    violations.push(...findings.map(finding => formatViolation(filePath, finding)));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: NOTHING_FOUND,
    summarize: count => `${count} violation(s): ${SUMMARY}`
  });
}

await runAsEntryPoint(import.meta.main, checkBusinessBoundaries);
