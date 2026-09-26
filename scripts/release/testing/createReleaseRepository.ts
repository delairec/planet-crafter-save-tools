import {execFileSync} from 'node:child_process';
import {copyFile, mkdir, mkdtemp, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';

const RELEASE_SCRIPTS_DIRECTORY = join(import.meta.dir, '..');
const COPIED_SCRIPTS_DIRECTORY = 'scripts/release';
const ROOT_MANIFEST = JSON.stringify({name: 'release-fixture', private: true, workspaces: ['packages/*']}, null, 2);

export interface ScriptRun {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface ReleaseRepository {
  root: string;
  runGit: (gitArguments: string[]) => string;
  commitFile: (path: string, content: string, subject: string) => Promise<void>;
  readFile: (path: string) => Promise<string>;
  runScript: (scriptName: string) => ScriptRun;
  remove: () => Promise<void>;
}

async function copyReleaseScripts(root: string): Promise<void> {
  const scriptNames = (await readdir(RELEASE_SCRIPTS_DIRECTORY)).filter(name => name.endsWith('.ts') && !name.endsWith('.spec.ts'));

  await mkdir(join(root, COPIED_SCRIPTS_DIRECTORY), {recursive: true});
  await Promise.all(scriptNames.map(name => copyFile(join(RELEASE_SCRIPTS_DIRECTORY, name), join(root, COPIED_SCRIPTS_DIRECTORY, name))));
}

export async function createReleaseRepository(): Promise<ReleaseRepository> {
  const sandbox = await mkdtemp(join(tmpdir(), 'release-repository-'));
  const origin = join(sandbox, 'origin.git');
  const root = join(sandbox, 'work');

  function runGitIn(cwd: string, gitArguments: string[]): string {
    return execFileSync('git', gitArguments, {cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
  }

  const runGit = (gitArguments: string[]) => runGitIn(root, gitArguments);

  async function commitFile(path: string, content: string, subject: string): Promise<void> {
    await mkdir(join(root, dirname(path)), {recursive: true});
    await writeFile(join(root, path), content);
    runGit(['add', '--', path]);
    runGit(['commit', '--quiet', '-m', subject]);
  }

  await mkdir(root);
  runGitIn(sandbox, ['init', '--quiet', '--bare', origin]);
  runGit(['init', '--quiet', '--initial-branch=master']);
  runGit(['config', 'user.name', 'Salengor']);
  runGit(['config', 'user.email', 'salengor@example.com']);
  runGit(['remote', 'add', 'origin', origin]);
  await copyReleaseScripts(root);
  await writeFile(join(root, 'package.json'), ROOT_MANIFEST);
  runGit(['add', '--', '.']);
  runGit(['commit', '--quiet', '-m', 'chore: add the release scripts']);

  return {
    root,
    runGit,
    commitFile,
    readFile: path => readFile(join(root, path), 'utf8'),
    runScript: scriptName => {
      const result = Bun.spawnSync(['bun', join(COPIED_SCRIPTS_DIRECTORY, scriptName)], {cwd: root, stdout: 'pipe', stderr: 'pipe'});

      return {exitCode: result.exitCode, stdout: result.stdout.toString(), stderr: result.stderr.toString()};
    },
    remove: () => rm(sandbox, {recursive: true, force: true})
  };
}
