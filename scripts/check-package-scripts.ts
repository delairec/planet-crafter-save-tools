import {basename, dirname} from 'node:path';
import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {reportViolations} from './specSources.ts';

const ROOT_MANIFEST_PATH = 'package.json';
const PACKAGE_MANIFESTS_PATTERN = 'packages/*/package.json';
const CLI_PACKAGE_DIRECTORY = /^packages\/cli-[^/]+$/;
const BUN_WITH_CWD = /(?:^|[\s;&|(])bun\s(?:[^;&|]*\s)?--cwd(?:[\s=]|$)/;
const CHECK_NAME = 'check:package-scripts';

export interface ManifestScripts {
  /** the manifest path, relative to the repository root */
  manifestPath: string;
  /** the entry point the manifest declares under main, relative to its package */
  main?: string;
  scripts: Record<string, string>;
}

/**
 * @param {ManifestScripts} manifest a package manifest of the repository
 * @returns whether it is the manifest of a cli- package, whose command the root scripts alone run
 */
function isCliPackageManifest({manifestPath}: ManifestScripts): boolean {
  return CLI_PACKAGE_DIRECTORY.test(dirname(manifestPath));
}

/**
 * @param {ManifestScripts} manifest a package manifest of the repository
 * @returns one message per script breaking a rule of the package scripts
 */
function explainScriptViolations(manifest: ManifestScripts): string[] {
  const violations: string[] = [];
  const entryFileName = manifest.main === undefined ? undefined : basename(manifest.main);
  for (const [scriptName, command] of Object.entries(manifest.scripts)) {
    if (BUN_WITH_CWD.test(command)) {
      violations.push(`${manifest.manifestPath} scripts.${scriptName} runs bun with --cwd`);
    }
    if (isCliPackageManifest(manifest) && entryFileName !== undefined && command.includes(entryFileName)) {
      violations.push(`${manifest.manifestPath} scripts.${scriptName} runs the entry point ${manifest.main}, which only the root scripts run`);
    }
  }
  return violations;
}

/**
 * A package script that runs bun with --cwd names a path relative to another directory than its
 * own, and a cli- package script running its entry point duplicates the root script that already
 * does: the root scripts are the only entry of a command.
 * @param {ManifestScripts[]} manifests every manifest of the repository, the root one included
 * @returns one message per offending script
 */
export function findPackageScriptViolations(manifests: ManifestScripts[]): string[] {
  return manifests.flatMap(explainScriptViolations);
}

/**
 * @param {ScriptIo} io the file system the manifests are read from
 * @returns the path, the entry point and the scripts of every manifest of the repository
 */
async function readManifests(io: ScriptIo): Promise<ManifestScripts[]> {
  const manifestPaths = [ROOT_MANIFEST_PATH];
  for await (const manifestPath of io.scanFiles(PACKAGE_MANIFESTS_PATTERN)) {
    manifestPaths.push(manifestPath);
  }
  return Promise.all(manifestPaths.sort().map(async manifestPath => {
    const {main, scripts = {}} = JSON.parse(await io.readText(manifestPath));
    return {manifestPath, main, scripts};
  }));
}

/**
 * @param {ScriptIo} io the input and output of the guard
 */
export async function checkPackageScripts(io: ScriptIo): Promise<void> {
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations: findPackageScriptViolations(await readManifests(io)),
    nothingFound: 'no script runs bun with --cwd, and no cli- package script runs its entry point.',
    summarize: count => `${count} script(s) breaking the rules of the package scripts.`
  });
}

await runAsEntryPoint(import.meta.main, checkPackageScripts);
