// fallow-ignore-file coverage-gaps -- spawned as a real process by release-tag.spec.ts, which no static import reaches
import {findVersionCommit} from './findVersionCommit.ts';
import {composeTag, findVersionsToTag} from './findVersionsToTag.ts';
import {readWorkspace, REPOSITORY_ROOT, runGit} from './readWorkspace.ts';
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
  const untaggedConsumers = findVersionsToTag(consumers, runGit(['tag', '--list']).split('\n'));

  if (untaggedConsumers.length === 0) {
    console.log('Every declared version is already tagged.');
    return;
  }

  const tags = untaggedConsumers.map(consumer => {
    const tag = composeTag(consumer);
    const versionCommit = findVersionCommit({repositoryRoot: REPOSITORY_ROOT, manifestPath: consumer.manifestPath, version: consumer.version});

    runGit(['tag', '--annotate', tag, '--message', tag, versionCommit]);
    console.log(`Tagged ${tag} on ${versionCommit}`);
    return tag;
  });
  console.log(`Push the tags: git push origin ${tags.join(' ')}`);
}

await tagRelease();
