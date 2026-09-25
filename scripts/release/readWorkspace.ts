import {Glob} from 'bun';
import {dirname, join} from 'node:path';
import type {WorkspaceManifest} from './resolveConsumerPaths.ts';

const MANIFEST_PATTERN = 'packages/*/package.json';

export const REPOSITORY_ROOT = join(import.meta.dir, '../..');

export interface WorkspacePackage extends WorkspaceManifest {
  version: string;
  manifestPath: string;
}

interface PackageManifest {
  name: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export async function readWorkspace(): Promise<WorkspacePackage[]> {
  const manifestPaths = [...new Glob(MANIFEST_PATTERN).scanSync({cwd: REPOSITORY_ROOT})].sort();

  return Promise.all(manifestPaths.map(async manifestPath => {
    const manifest: PackageManifest = await Bun.file(join(REPOSITORY_ROOT, manifestPath)).json();

    return {
      directory: dirname(manifestPath),
      name: manifest.name,
      version: manifest.version ?? '',
      dependencies: Object.keys({...manifest.dependencies, ...manifest.devDependencies}),
      manifestPath
    };
  }));
}

export function runGit(gitArguments: string[]): string {
  const result = Bun.spawnSync(['git', ...gitArguments], {cwd: REPOSITORY_ROOT});

  if (result.exitCode !== 0) {
    throw new Error(`git ${gitArguments.join(' ')} failed: ${result.stderr.toString().trim()}`);
  }
  return result.stdout.toString().trim();
}
