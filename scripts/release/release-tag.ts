import {findVersionsToTag} from './findVersionsToTag.ts';
import {readWorkspace, runGit} from './readWorkspace.ts';
import {resolveConsumerPaths} from './resolveConsumerPaths.ts';

const RELEASE_BRANCH = 'master';

async function tagRelease(): Promise<void> {
  const currentBranch = runGit(['branch', '--show-current']);
  if (currentBranch !== RELEASE_BRANCH) {
    throw new Error(`A version is tagged on ${RELEASE_BRANCH} once its release pull request is merged; the current branch is ${currentBranch}.`);
  }

  runGit(['fetch', '--quiet', '--tags', 'origin']);
  const workspacePackages = await readWorkspace();
  const consumerNames = resolveConsumerPaths(workspacePackages).map(consumer => consumer.name);
  const consumers = workspacePackages.filter(workspacePackage => consumerNames.includes(workspacePackage.name));
  const tags = findVersionsToTag(consumers, runGit(['tag', '--list']).split('\n'));

  if (tags.length === 0) {
    console.log('Every declared version is already tagged.');
    return;
  }

  for (const tag of tags) {
    runGit(['tag', '--annotate', tag, '--message', tag]);
    console.log(`Tagged ${tag}`);
  }
  console.log(`Push the tags: git push origin ${tags.join(' ')}`);
}

await tagRelease();
