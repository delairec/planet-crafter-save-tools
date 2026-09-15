import {maskStringLiterals, readOwnSourceFiles, reportViolations} from './specSources.ts';

const SCENARIO_FILES_PATTERN = '**/*.e2e.ts';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;
const SCENARIO_EXTENSION = /\.e2e\.ts$/;

const TEST_IDENTIFIER_LOCATOR = /\bgetByTestId\s*\(/;
const TEST_IDENTIFIER_ATTRIBUTE = 'data-testid';
const SELECTOR_QUERY = /\.locator\s*\(|\bquerySelector(?:All)?\s*\(|\bwaitForSelector\s*\(/;
const SELECTOR_TAKING_PAGE_ACTION = /\bpage\s*\.\s*(?:\$\$?(?:eval)?|click|dblclick|fill|focus|hover|type|press|check|uncheck|selectOption|setInputFiles|textContent|innerText|innerHTML|getAttribute|isVisible|isHidden|isEnabled|isDisabled|isChecked|isEditable|tap|dispatchEvent)\s*\(/;
const REFERENCE_SCREENSHOT = /\btoHaveScreenshot\s*\(|\btoMatchSnapshot\s*\(|\.screenshot\s*\(/;
export const AMBIGUOUS_BUSY_LABEL = 'Loading...';
const QUOTES = ['\'', '"', '`'];

const TEST_IDENTIFIER_REASON = 'a scenario designates an element by what the screen shows, never by a test identifier';
const CSS_SELECTOR_REASON = 'a scenario designates an element by its role, its label or its text, never by a CSS selector';
const REFERENCE_SCREENSHOT_REASON = 'a scenario asserts what the screen shows in words, never against a reference screenshot';
const AMBIGUOUS_BUSY_LABEL_REASON = 'the busy indicator is designated by its status role, the hydration fallback carrying the same label';

const CHECK_NAME = 'check:locators';

export interface ScenarioLocatorViolation {
  line: number;
  reason: string;
}

/**
 * @param {string} filePath a source file path relative to the repository root
 * @returns whether that file is a scenario of the end-to-end suite
 */
export function isScenarioFile(filePath: string): boolean {
  return SCENARIO_EXTENSION.test(filePath) && !GENERATED_DIRECTORY.test(filePath);
}

/**
 * @param {string} text a raw scenario line
 * @returns whether that line quotes the label the hydration fallback and the busy indicator share
 */
function quotesAmbiguousBusyLabel(text: string): boolean {
  return QUOTES.some(quote => text.includes(`${quote}${AMBIGUOUS_BUSY_LABEL}${quote}`));
}

/**
 * @param {string} source the whole content of a scenario file
 * @returns every line designating an element by something other than what the screen shows
 */
export function findScenarioLocatorViolations(source: string): ScenarioLocatorViolation[] {
  return source.split('\n').flatMap((text, lineIndex) => {
    const code = maskStringLiterals(text);
    const line = lineIndex + 1;
    const designatesByTestIdentifier = TEST_IDENTIFIER_LOCATOR.test(code) || text.includes(TEST_IDENTIFIER_ATTRIBUTE);
    const designatesByCssSelector = SELECTOR_QUERY.test(code) || SELECTOR_TAKING_PAGE_ACTION.test(code);
    return [
      ...designatesByTestIdentifier ? [{line, reason: TEST_IDENTIFIER_REASON}] : [],
      ...designatesByCssSelector ? [{line, reason: CSS_SELECTOR_REASON}] : [],
      ...REFERENCE_SCREENSHOT.test(code) ? [{line, reason: REFERENCE_SCREENSHOT_REASON}] : [],
      ...quotesAmbiguousBusyLabel(text) ? [{line, reason: AMBIGUOUS_BUSY_LABEL_REASON}] : []
    ];
  });
}

async function checkScenarioLocators(): Promise<number> {
  const violations: string[] = [];
  for await (const {filePath, source} of readOwnSourceFiles(SCENARIO_FILES_PATTERN)) {
    if (!isScenarioFile(filePath)) {
      continue;
    }
    findScenarioLocatorViolations(source)
      .forEach(({line, reason}) => violations.push(`${filePath}:${line}\n  ${reason}`));
  }
  return reportViolations({
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no scenario designates an element by something other than what the screen shows.',
    summarize: count => `${count} line(s) designating an element by something other than what the screen shows.`
  });
}

if (import.meta.main) {
  process.exit(await checkScenarioLocators());
}
