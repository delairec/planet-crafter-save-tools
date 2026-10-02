import type {ScriptIo} from '../../common/scriptIo.ts';

const MANIFEST_FILES_PATTERN = 'packages/*/package.json';

export async function readWorkspacePackageNames(io: ScriptIo): Promise<Set<string>> {
  const names = new Set<string>();
  for await (const manifestPath of io.scanFiles(MANIFEST_FILES_PATTERN)) {
    const {name} = JSON.parse(await io.readText(manifestPath)) as {name: string};
    names.add(name);
  }
  return names;
}
