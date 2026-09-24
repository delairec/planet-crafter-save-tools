export interface ConsumerVersion {
  name: string;
  version: string;
}

const INITIAL_VERSION = '0.0.0';

export function composeTag({name, version}: ConsumerVersion): string {
  return `${name}-v${version}`;
}

export function findVersionsToTag<Consumer extends ConsumerVersion>(consumers: Consumer[], existingTags: string[]): Consumer[] {
  return consumers.filter((consumer) => !existingTags.includes(composeTag(consumer)));
}

/**
 * Only the initial version may lack its tag: a later version without one was never tagged, and reading the whole
 * history instead would count the commits of that release a second time.
 */
export function findSinceTag(consumer: ConsumerVersion, existingTags: string[]): string | undefined {
  const versionTag = composeTag(consumer);

  if (existingTags.includes(versionTag)) {
    return versionTag;
  }
  if (consumer.version === INITIAL_VERSION) {
    return undefined;
  }
  throw new Error(`${consumer.name} declares ${consumer.version} but no tag ${versionTag} exists: run bun run release:tag on master and push its tags first.`);
}
