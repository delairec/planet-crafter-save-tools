import type {ScriptIo} from '../../common/scriptIo.ts';

export interface ShrinkingAllowList {
  path: string;
  files: string[];
}

export async function readAllowList(io: ScriptIo, path: string): Promise<ShrinkingAllowList> {
  const files: unknown = JSON.parse(await io.readText(path));
  if (!Array.isArray(files) || !files.every(file => typeof file === 'string')) {
    throw new Error(`${path} must be a JSON array of file paths`);
  }
  return {path, files};
}

export function applyAllowList(allowList: ShrinkingAllowList, violationsByFile: Map<string, string[]>): string[] {
  const keptViolations = [...violationsByFile]
    .filter(([filePath]) => !allowList.files.includes(filePath))
    .flatMap(([, violations]) => violations);
  const staleEntries = allowList.files
    .filter(filePath => !violationsByFile.has(filePath))
    .map(filePath => `${allowList.path}: ${filePath} is no longer reported\n  remove its entry: the allow-list only shrinks`);
  return [...keptViolations, ...staleEntries];
}
