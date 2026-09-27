import {join} from 'node:path';
import {addChangelogEntry, type ReleasedConsumer} from './addChangelogEntry.ts';
import {planRelease} from './planRelease.ts';
import {readCommits, type ReleaseCommit} from './readCommits.ts';
import {findSinceTag} from './findVersionsToTag.ts';
import {readWorkspace, REPOSITORY_ROOT, runGit, type WorkspacePackage} from './readWorkspace.ts';
import {resolveConsumerPaths} from './resolveConsumerPaths.ts';

const CHANGELOG_FILE_NAME = 'CHANGELOG.md';

async function writeManifestVersion(workspacePackage: WorkspacePackage, version: string): Promise<void> {
  const manifestFile = Bun.file(join(REPOSITORY_ROOT, workspacePackage.manifestPath));
  const declaredVersion = `"version": "${workspacePackage.version}"`;
  const manifestText = await manifestFile.text();

  if (!manifestText.includes(declaredVersion)) {
    throw new Error(`${workspacePackage.manifestPath} declares no ${declaredVersion}`);
  }
  await Bun.write(manifestFile, manifestText.replace(declaredVersion, `"version": "${version}"`));
}

interface ChangelogWrite {
  path: string;
  text: string;
}

async function composeChangelog(release: ReleasedConsumer, date: string): Promise<ChangelogWrite> {
  const path = join(REPOSITORY_ROOT, release.directory, CHANGELOG_FILE_NAME);
  const changelogFile = Bun.file(path);
  const changelog = await changelogFile.exists() ? await changelogFile.text() : undefined;

  return {path, text: addChangelogEntry({changelog, release, date})};
}

async function release(): Promise<void> {
  runGit(['fetch', '--quiet', '--tags', 'origin']);
  const existingTags = runGit(['tag', '--list']).split('\n');
  const workspacePackages = await readWorkspace();
  const packagesByName = new Map(workspacePackages.map(workspacePackage => [workspacePackage.name, workspacePackage]));
  const packagesByDirectory = new Map(workspacePackages.map(workspacePackage => [workspacePackage.directory, workspacePackage]));
  const consumers = resolveConsumerPaths(workspacePackages);
  const commitsByConsumer = new Map<string, ReleaseCommit[]>(consumers.map(consumer => {
    const {version} = packagesByName.get(consumer.name)!;
    const sinceTag = findSinceTag({name: consumer.name, version}, existingTags);

    return [consumer.name, readCommits({repositoryRoot: REPOSITORY_ROOT, sinceTag, paths: consumer.paths})];
  }));
  const releases = planRelease(consumers.map(consumer => ({
    name: consumer.name,
    version: packagesByName.get(consumer.name)!.version,
    commitSubjects: commitsByConsumer.get(consumer.name)!.map(commit => commit.subject)
  })));

  if (releases.length === 0) {
    console.log('No consumer changed since its last version.');
    return;
  }

  const consumersByName = new Map(consumers.map(consumer => [consumer.name, consumer]));
  const releasedConsumers: ReleasedConsumer[] = releases.map(plannedRelease => {
    const consumer = consumersByName.get(plannedRelease.name)!;

    return {
      name: plannedRelease.name,
      version: plannedRelease.version,
      directory: consumer.directory,
      commits: commitsByConsumer.get(plannedRelease.name)!,
      dependencies: consumer.paths.filter(path => path !== consumer.directory).map(path => {
        const dependency = packagesByDirectory.get(path)!;

        return {name: dependency.name, directory: dependency.directory, changelogLine: dependency.changelogLine};
      })
    };
  });
  const date = new Date().toISOString().slice(0, 10);
  const changelogWrites = await Promise.all(releasedConsumers.map(release => composeChangelog(release, date)));
  for (const plannedRelease of releases) {
    const workspacePackage = packagesByName.get(plannedRelease.name)!;
    await writeManifestVersion(workspacePackage, plannedRelease.version);
    console.log(`${plannedRelease.name} ${workspacePackage.version} → ${plannedRelease.version} (${plannedRelease.commitSubjects.length} commit(s))`);
  }
  for (const changelogWrite of changelogWrites) {
    await Bun.write(changelogWrite.path, changelogWrite.text);
  }
  Bun.spawnSync(['bun', 'install'], {cwd: REPOSITORY_ROOT, stdout: 'inherit', stderr: 'inherit'});

  const releaseNames = releases.map(plannedRelease => `${plannedRelease.name} ${plannedRelease.version}`).join(', ');
  console.log(`Open the release pull request against master: chore(release): ${releaseNames}`);
}

await release();
