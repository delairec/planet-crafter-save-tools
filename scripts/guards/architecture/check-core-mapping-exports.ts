import {runAsEntryPoint, type ScriptIo} from '../../common/scriptIo.ts';
import {reportViolations} from '../common/specSources.ts';

const PACKAGE_DIRECTORY = 'packages/core-mapping/';
const MANIFEST_PATH = `${PACKAGE_DIRECTORY}package.json`;

const COMPOSITION_ROOT_EXPORT = /^\.\/[^/*]+\/composition\/compositionRoot$/;
const VIEW_MODELS_EXPORT = /^\.\/[^/*]+\/presentation\/viewModels\/\*$/;
const SECTION_CONTROLLER_EXPORT = /^export\b.*\bLoad\w*SectionController\b/;

const EXPORT_BEYOND_BOUNDARY_REASON = 'core-mapping exports the composition root of a business, ./<business>/composition/compositionRoot, and its view models, ./<business>/presentation/viewModels/*, each from the same path under ./src';
const SECTION_CONTROLLER_REASON = 'a wired controller serves a page or a zone of the save manager, or a CLI; a Load*SectionController serves one section of the save';

const CHECK_NAME = 'check:core-mapping-exports';

interface CoreMappingManifest {
  exports: Record<string, string>;
}

function isWithinBoundary(key: string, target: string): boolean {
  return (COMPOSITION_ROOT_EXPORT.test(key) || VIEW_MODELS_EXPORT.test(key))
    && target === `./src/${key.slice('./'.length)}.ts`;
}

async function findSectionControllerExports(io: ScriptIo, target: string): Promise<string[]> {
  const filePath = `${PACKAGE_DIRECTORY}${target.slice('./'.length)}`;
  const source = await io.readText(filePath);
  return source
    .split('\n')
    .flatMap((line, lineIndex) => SECTION_CONTROLLER_EXPORT.test(line)
      ? [`${filePath}:${lineIndex + 1}\n  ${SECTION_CONTROLLER_REASON}`]
      : []);
}

export async function checkCoreMappingExports(io: ScriptIo): Promise<void> {
  const manifest: CoreMappingManifest = JSON.parse(await io.readText(MANIFEST_PATH));
  const violations: string[] = [];
  for (const [key, target] of Object.entries(manifest.exports)) {
    if (!isWithinBoundary(key, target)) {
      violations.push(`${MANIFEST_PATH} "${key}": "${target}"\n  ${EXPORT_BEYOND_BOUNDARY_REASON}`);
      continue;
    }
    if (COMPOSITION_ROOT_EXPORT.test(key)) {
      violations.push(...await findSectionControllerExports(io, target));
    }
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'core-mapping exports the composition root and the view models of each business, and no composition root wires a section controller.',
    summarize: count => `${count} export(s) of core-mapping beyond its boundary.`
  });
}

await runAsEntryPoint(import.meta.main, checkCoreMappingExports);
