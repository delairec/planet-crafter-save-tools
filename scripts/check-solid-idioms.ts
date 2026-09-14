import {Glob} from 'bun';
import {maskStringLiterals, reportViolations} from './specSources.ts';

const COMPONENT_FILES_PATTERN = 'packages/*/**/*.tsx';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;
const COMPONENT_EXTENSION = /\.tsx$/;

const DESTRUCTURED_PROPS = /\b(?:function\s+[A-Z]\w*\s*(?:<[^(]*>)?\s*\(\s*\{|const\s+[A-Z]\w*\s*(?::[^=]*)?=\s*(?:<[^(]*>\s*)?\(\s*\{)/;
const ASSERTED_ACCESSOR = /\(\)!/;

const DESTRUCTURED_PROPS_REASON = 'a component reads its props through the props object, never destructured in its signature';
const ASSERTED_ACCESSOR_REASON = 'an accessor is bound by the callback form of Show, never asserted non-null';

const CHECK_NAME = 'check:idioms';

export interface IdiomViolation {
  line: number;
  reason: string;
}

/**
 * @param {string} filePath a source file path relative to the repository root
 * @returns whether the Solid idioms apply to that file
 */
export function isSolidComponentFile(filePath: string): boolean {
  return COMPONENT_EXTENSION.test(filePath) && !GENERATED_DIRECTORY.test(filePath);
}

/**
 * @param {string} source the whole content of a component file
 * @returns every line breaking one of the two idioms a line reading can tell apart, in file order
 */
export function findIdiomViolations(source: string): IdiomViolation[] {
  return source.split('\n').flatMap((text, lineIndex) => {
    const code = maskStringLiterals(text);
    const line = lineIndex + 1;
    return [
      ...DESTRUCTURED_PROPS.test(code) ? [{line, reason: DESTRUCTURED_PROPS_REASON}] : [],
      ...ASSERTED_ACCESSOR.test(code) ? [{line, reason: ASSERTED_ACCESSOR_REASON}] : []
    ];
  });
}

async function checkSolidIdioms(): Promise<number> {
  const violations: string[] = [];
  for await (const filePath of new Glob(COMPONENT_FILES_PATTERN).scan({cwd: process.cwd()})) {
    if (!isSolidComponentFile(filePath)) {
      continue;
    }
    findIdiomViolations(await Bun.file(filePath).text())
      .forEach(({line, reason}) => violations.push(`${filePath}:${line}\n  ${reason}`));
  }
  return reportViolations({
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no component breaks a Solid idiom a line reading can tell apart.',
    summarize: count => `${count} line(s) breaking a Solid idiom.`
  });
}

if (import.meta.main) {
  process.exit(await checkSolidIdioms());
}
