import {readOwnSourceFiles, reportViolations} from './specSources.ts';

const SCENARIO_FILES_PATTERN = '**/*.e2e.{ts,tsx}';
const INPUT_DIRECTORY_PATH = /(?<![\w.\-])(?:\.{1,2}\/)*input\//;

const INPUT_DIRECTORY_REASON = 'a scenario reads only the fixtures its generator writes: the input directory is unversioned and absent from a machine without the private repository';

export interface InputDirectoryReference {
  line: number;
  text: string;
}

export function findInputDirectoryReferences(source: string): InputDirectoryReference[] {
  return source.split('\n')
    .map((text, lineIndex) => ({line: lineIndex + 1, text: text.trim()}))
    .filter(({text}) => INPUT_DIRECTORY_PATH.test(text));
}

async function collectInputDirectoryReferences(): Promise<string[]> {
  const violations: string[] = [];
  for await (const {filePath, source} of readOwnSourceFiles(SCENARIO_FILES_PATTERN)) {
    findInputDirectoryReferences(source)
      .forEach(({line, text}) => violations.push(`${filePath}:${line}: ${text}\n  ${INPUT_DIRECTORY_REASON}`));
  }

  return violations;
}

async function checkScenarioFixtures(): Promise<number> {
  return reportViolations({
    checkName: 'check:scenario-fixtures',
    violations: await collectInputDirectoryReferences(),
    nothingFound: 'no scenario reads the input directory.',
    summarize: count => `${count} input directory reference(s) to settle.`
  });
}

if (import.meta.main) {
  process.exit(await checkScenarioFixtures());
}
