import {join} from 'node:path';
import {addChangelogEntry} from './addChangelogEntry.ts';
import {planRelease, type PlannedRelease} from './planRelease.ts';
import {readCommitSubjects} from './readCommitSubjects.ts';
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

async function writeChangelog(workspacePackage: WorkspacePackage, release: PlannedRelease, date: string): Promise<void> {
  const changelogFile = Bun.file(join(REPOSITORY_ROOT, workspacePackage.directory, CHANGELOG_FILE_NAME));
  const changelog = await changelogFile.exists() ? await changelogFile.text() : undefined;

  await Bun.write(changelogFile, addChangelogEntry({changelog, release, date}));
}

async function release(): Promise<void> {
  runGit(['fetch', '--quiet', '--tags', 'origin']);
  const existingTags = runGit(['tag', '--list']).split('\n');
  const workspacePackages = await readWorkspace();
  const packagesByName = new Map(workspacePackages.map(workspacePackage => [workspacePackage.name, workspacePackage]));

  const histories = resolveConsumerPaths(workspacePackages).map(consumer => {
    const {version} = packagesByName.get(consumer.name)!;
    const sinceTag = findSinceTag({name: consumer.name, version}, existingTags);

    return {name: consumer.name, version, commitSubjects: readCommitSubjects({repositoryRoot: REPOSITORY_ROOT, sinceTag, paths: consumer.paths})};
  });
  const releases = planRelease(histories);

  if (releases.length === 0) {
    console.log('No consumer changed since its last version.');
    return;
  }

  const date = new Date().toISOString().slice(0, 10);
  for (const plannedRelease of releases) {
    const workspacePackage = packagesByName.get(plannedRelease.name)!;
    await writeManifestVersion(workspacePackage, plannedRelease.version);
    await writeChangelog(workspacePackage, plannedRelease, date);
    console.log(`${plannedRelease.name} ${workspacePackage.version} → ${plannedRelease.version} (${plannedRelease.commitSubjects.length} commit(s))`);
  }
  Bun.spawnSync(['bun', 'install'], {cwd: REPOSITORY_ROOT, stdout: 'inherit', stderr: 'inherit'});

  const releaseNames = releases.map(plannedRelease => `${plannedRelease.name} ${plannedRelease.version}`).join(', ');
  console.log(`Open the release pull request against master: chore(release): ${releaseNames}`);
}

await release();
