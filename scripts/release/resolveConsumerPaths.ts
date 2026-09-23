export interface WorkspaceManifest {
  directory: string;
  name: string;
  dependencies: string[];
}

export interface ConsumerPaths {
  name: string;
  directory: string;
  paths: string[];
}

const CONSUMER_PREFIXES = ['cli-', 'ui-'];

function isConsumer(manifest: WorkspaceManifest): boolean {
  return CONSUMER_PREFIXES.some((prefix) => manifest.name.startsWith(prefix));
}

function collectReachableDirectories(
  manifest: WorkspaceManifest,
  manifestsByName: Map<string, WorkspaceManifest>,
  reachedDirectories: Set<string>
): void {
  if (reachedDirectories.has(manifest.directory)) {
    return;
  }
  reachedDirectories.add(manifest.directory);
  for (const dependency of manifest.dependencies) {
    const dependencyManifest = manifestsByName.get(dependency);
    if (dependencyManifest) {
      collectReachableDirectories(dependencyManifest, manifestsByName, reachedDirectories);
    }
  }
}

export function resolveConsumerPaths(manifests: WorkspaceManifest[]): ConsumerPaths[] {
  const manifestsByName = new Map(manifests.map((manifest) => [manifest.name, manifest]));
  return manifests.filter(isConsumer).map((consumer) => {
    const reachedDirectories = new Set<string>();
    collectReachableDirectories(consumer, manifestsByName, reachedDirectories);
    return {name: consumer.name, directory: consumer.directory, paths: [...reachedDirectories].sort()};
  });
}
