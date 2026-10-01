import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {reportViolations} from './specSources.ts';

const MANIFEST_FILES_PATTERN = 'packages/*/package.json';
const SOURCE_FILES_PATTERN = 'packages/*/**/*.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;

const FROM_SPECIFIER_PATTERN = /\bfrom\s+['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT_SPECIFIER_PATTERN = /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
const RELATIVE_OR_ALIASED_SPECIFIER = /^[./~]/;
const SPEC_FILE_PATTERN = /\.spec\.(?:js|ts|tsx)$/;
const TEST_SUPPORT_FOLDER = 'testing';

const DEPENDENCY_MATRIX: DependencyMatrix = {
  'core-': ['shared-', 'util-', 'data-'],
  'util-': [],
  'cli-': ['shared-', 'util-', 'core-'],
  'ui-': ['shared-', 'util-', 'core-'],
  'shared-': ['util-', 'data-'],
  'data-': []
};

const INTERFACE_PRODUCTION_IMPORTS: InterfaceProductionImports = {
  'cli-': {prefixes: ['core-'], packages: ['shared-platforms']},
  'ui-': {prefixes: ['core-'], packages: []}
};

export interface WorkspacePackage {
  name: string;
  manifestPath: string;
  declaredDependencies: string[];
}

export interface PackageImport {
  packageName: string;
  filePath: string;
  line: number;
  specifier: string;
}

export type DependencyMatrix = Record<string, string[]>;

export interface ProductionImports {
  prefixes: string[];
  packages: string[];
}

export type InterfaceProductionImports = Record<string, ProductionImports>;

export interface DependencyViolation {
  location: string;
  message: string;
}

export interface ImportedPackage {
  line: number;
  specifier: string;
}

function findImportedPackagesOnLine(line: string, lineNumber: number): ImportedPackage[] {
  const specifiers = [
    ...Array.from(line.matchAll(FROM_SPECIFIER_PATTERN), match => match[1]),
    ...Array.from(line.matchAll(DYNAMIC_IMPORT_SPECIFIER_PATTERN), match => match[1])
  ];
  return specifiers
    .filter(specifier => !RELATIVE_OR_ALIASED_SPECIFIER.test(specifier))
    .map(specifier => ({line: lineNumber, specifier}));
}

export function findImportedPackages(source: string): ImportedPackage[] {
  return source.split('\n').flatMap((line, lineIndex) => findImportedPackagesOnLine(line, lineIndex + 1));
}

function findEntryOfPrefix<Rule>(packageName: string, rulesByPrefix: Record<string, Rule>): [string, Rule] | undefined {
  return Object.entries(rulesByPrefix).find(([prefix]) => packageName.startsWith(prefix));
}

function describeAllowedPrefixes(allowedPrefixes: string[]): string {
  return allowedPrefixes.length === 0
    ? 'may not depend on any workspace package'
    : `may only depend on ${allowedPrefixes.join(', ')}`;
}

function extractPackageName(specifier: string): string {
  const slashIndex = specifier.indexOf('/');
  return slashIndex === -1 ? specifier : specifier.slice(0, slashIndex);
}

function collectManifestViolations(consumer: WorkspacePackage, workspacePackagesByName: Map<string, WorkspacePackage>, matrix: DependencyMatrix, imports: PackageImport[]): DependencyViolation[] {
  const consumerEntry = findEntryOfPrefix(consumer.name, matrix);
  if (!consumerEntry) {
    return [{location: consumer.manifestPath, message: `package name ${consumer.name} carries no prefix of the dependency matrix`}];
  }

  const [consumerPrefix, allowedPrefixes] = consumerEntry;
  const violations: DependencyViolation[] = [];
  for (const dependencyName of consumer.declaredDependencies) {
    if (dependencyName === consumer.name || !workspacePackagesByName.has(dependencyName)) {
      continue;
    }

    const dependencyEntry = findEntryOfPrefix(dependencyName, matrix);
    if (!dependencyEntry || !allowedPrefixes.includes(dependencyEntry[0])) {
      violations.push({
        location: consumer.manifestPath,
        message: `dependency on ${dependencyName}: a ${consumerPrefix} package ${describeAllowedPrefixes(allowedPrefixes)}`
      });
      continue;
    }

    const isImported = imports.some(candidate => candidate.packageName === consumer.name && extractPackageName(candidate.specifier) === dependencyName);
    if (!isImported) {
      violations.push({location: consumer.manifestPath, message: `dependency on ${dependencyName}: never imported`});
    }
  }
  return violations;
}

function isProductionSource(filePath: string): boolean {
  return !SPEC_FILE_PATTERN.test(filePath) && !filePath.split('/').includes(TEST_SUPPORT_FOLDER);
}

function mayBeImportedByProductionSource(packageName: string, {prefixes, packages}: ProductionImports): boolean {
  return prefixes.some(prefix => packageName.startsWith(prefix)) || packages.includes(packageName);
}

function describeRefusedProductionImport({packageName, filePath}: PackageImport, importedPackageName: string, interfaceProductionImports: InterfaceProductionImports): string | undefined {
  const interfaceEntry = findEntryOfPrefix(packageName, interfaceProductionImports);
  if (!interfaceEntry || !isProductionSource(filePath)) {
    return undefined;
  }

  const [interfacePrefix, productionImports] = interfaceEntry;
  if (mayBeImportedByProductionSource(importedPackageName, productionImports)) {
    return undefined;
  }

  const allowedImports = [...productionImports.prefixes, ...productionImports.packages].join(', ');
  return `a production source of a ${interfacePrefix} package may only import ${allowedImports}`;
}

function collectImportViolation(sourceImport: PackageImport, workspacePackagesByName: Map<string, WorkspacePackage>, matrix: DependencyMatrix, interfaceProductionImports: InterfaceProductionImports): DependencyViolation | undefined {
  const importedPackageName = extractPackageName(sourceImport.specifier);
  if (importedPackageName === sourceImport.packageName || !workspacePackagesByName.has(importedPackageName)) {
    return undefined;
  }

  const consumer = workspacePackagesByName.get(sourceImport.packageName);
  const consumerEntry = findEntryOfPrefix(sourceImport.packageName, matrix);
  if (!consumer || !consumerEntry) {
    return undefined;
  }

  const [consumerPrefix, allowedPrefixes] = consumerEntry;
  const location = `${sourceImport.filePath}:${sourceImport.line}`;

  const dependencyEntry = findEntryOfPrefix(importedPackageName, matrix);
  if (!dependencyEntry || !allowedPrefixes.includes(dependencyEntry[0])) {
    return {location, message: `import of '${sourceImport.specifier}': a ${consumerPrefix} package ${describeAllowedPrefixes(allowedPrefixes)}`};
  }

  const refusedProductionImport = describeRefusedProductionImport(sourceImport, importedPackageName, interfaceProductionImports);
  if (refusedProductionImport) {
    return {location, message: `import of '${sourceImport.specifier}': ${refusedProductionImport}`};
  }

  if (!consumer.declaredDependencies.includes(importedPackageName)) {
    return {location, message: `import of '${sourceImport.specifier}': ${importedPackageName} is missing from the dependencies of ${consumer.manifestPath}`};
  }

  return undefined;
}

export function findViolations(packages: WorkspacePackage[], imports: PackageImport[], matrix: DependencyMatrix, interfaceProductionImports: InterfaceProductionImports): DependencyViolation[] {
  const workspacePackagesByName = new Map(packages.map(workspacePackage => [workspacePackage.name, workspacePackage]));

  const manifestViolations = packages.flatMap(consumer => collectManifestViolations(consumer, workspacePackagesByName, matrix, imports));
  const importViolations = imports
    .map(sourceImport => collectImportViolation(sourceImport, workspacePackagesByName, matrix, interfaceProductionImports))
    .filter((violation): violation is DependencyViolation => violation !== undefined);

  return [...manifestViolations, ...importViolations];
}

interface PackageManifest {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

function extractPackageDirectory(filePath: string): string {
  return filePath.split('/').slice(0, 2).join('/');
}

async function readWorkspacePackages(io: ScriptIo): Promise<WorkspacePackage[]> {
  const packages: WorkspacePackage[] = [];
  for await (const manifestPath of io.scanFiles(MANIFEST_FILES_PATTERN)) {
    const manifest: PackageManifest = JSON.parse(await io.readText(manifestPath));
    packages.push({
      name: manifest.name,
      manifestPath,
      declaredDependencies: Object.keys({...manifest.dependencies, ...manifest.devDependencies, ...manifest.peerDependencies})
    });
  }
  return packages.sort((first, second) => first.manifestPath.localeCompare(second.manifestPath));
}

async function readPackageImports(io: ScriptIo, packages: WorkspacePackage[]): Promise<PackageImport[]> {
  const packageNameByDirectory = new Map(packages.map(workspacePackage => [extractPackageDirectory(workspacePackage.manifestPath), workspacePackage.name]));
  const imports: PackageImport[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    const packageName = packageNameByDirectory.get(extractPackageDirectory(filePath));
    if (!packageName || GENERATED_DIRECTORY.test(filePath)) {
      continue;
    }
    const source = await io.readText(filePath);
    findImportedPackages(source).forEach(({line, specifier}) => imports.push({packageName, filePath, line, specifier}));
  }
  return imports.sort((first, second) => first.filePath.localeCompare(second.filePath) || first.line - second.line);
}

export async function checkPackageDependencies(io: ScriptIo): Promise<void> {
  const packages = await readWorkspacePackages(io);
  const imports = await readPackageImports(io, packages);
  reportViolations(io, {
    checkName: 'check:dependencies',
    violations: findViolations(packages, imports, DEPENDENCY_MATRIX, INTERFACE_PRODUCTION_IMPORTS).map(({location, message}) => `${location}: ${message}`),
    nothingFound: 'no dependency matrix violation found.',
    summarize: count => `${count} dependency matrix violation(s); see the dependency matrix in docs/wiki/architecture.md.`
  });
}

await runAsEntryPoint(import.meta.main, checkPackageDependencies);
