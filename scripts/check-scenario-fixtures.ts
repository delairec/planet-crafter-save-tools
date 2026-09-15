import {SCENARIO_FIXTURES, SCENARIO_FIXTURES_DIRECTORY, resolveScenarioFixturePath} from './generate-scenario-fixtures.ts';
import {readOwnSourceFiles, reportViolations} from './specSources.ts';

const SCENARIO_FILES_PATTERN = '**/*.e2e.{ts,tsx}';
const INPUT_DIRECTORY_PATH = /(?<![\w.\-])(?:\.{1,2}\/)*input\//;

const DIVERGED_FIXTURE_REASON = 'regenerating it does not reproduce the versioned file: run bun run generate:scenario-fixtures and commit what it writes';
const MISSING_FIXTURE_REASON = 'the generator declares it and the repository does not carry it: run bun run generate:scenario-fixtures and commit what it writes';
const INPUT_DIRECTORY_REASON = 'a scenario reads only the fixtures its generator writes: the input directory is unversioned and absent from a machine without the private repository';

export interface FixtureDivergence {
  fileName: string;
  reason: string;
}

export interface InputDirectoryReference {
  line: number;
  text: string;
}

/**
 * @param fixture what the generator writes today against what the repository carries, a null
 * versioned content standing for a fixture the repository does not carry
 * @returns what the rule asks for on that fixture, or null when the two match byte for byte
 */
export function findFixtureDivergence({fileName, regeneratedContent, versionedContent}: {
  fileName: string;
  regeneratedContent: string;
  versionedContent: string | null;
}): FixtureDivergence | null {
  if (versionedContent === null) {
    return {fileName, reason: MISSING_FIXTURE_REASON};
  }
  if (versionedContent !== regeneratedContent) {
    return {fileName, reason: DIVERGED_FIXTURE_REASON};
  }

  return null;
}

/**
 * @param {string} source the whole content of a scenario file
 * @returns every line reaching into the unversioned input directory, in file order
 */
export function findInputDirectoryReferences(source: string): InputDirectoryReference[] {
  return source.split('\n')
    .map((text, lineIndex) => ({line: lineIndex + 1, text: text.trim()}))
    .filter(({text}) => INPUT_DIRECTORY_PATH.test(text));
}

async function readVersionedFixture(fileName: string): Promise<string | null> {
  const versionedFile = Bun.file(resolveScenarioFixturePath(fileName));

  return await versionedFile.exists() ? versionedFile.text() : null;
}

async function collectFixtureDivergences(): Promise<string[]> {
  const violations: string[] = [];
  for (const {fileName, generateContent} of SCENARIO_FIXTURES) {
    const divergence = findFixtureDivergence({
      fileName,
      regeneratedContent: generateContent(),
      versionedContent: await readVersionedFixture(fileName)
    });
    if (divergence !== null) {
      violations.push(`${SCENARIO_FIXTURES_DIRECTORY}/${fileName}\n  ${divergence.reason}`);
    }
  }

  return violations;
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
    violations: [...await collectFixtureDivergences(), ...await collectInputDirectoryReferences()],
    nothingFound: 'every scenario fixture matches its generator, and no scenario reads the input directory.',
    summarize: count => `${count} scenario fixture(s) or input directory reference(s) to settle.`
  });
}

if (import.meta.main) {
  process.exit(await checkScenarioFixtures());
}
