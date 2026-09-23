export interface ConsumerVersion {
  name: string;
  version: string;
}

export function composeTag({name, version}: ConsumerVersion): string {
  return `${name}-v${version}`;
}

export function findVersionsToTag(consumers: ConsumerVersion[], existingTags: string[]): string[] {
  return consumers.map(composeTag).filter((tag) => !existingTags.includes(tag));
}
