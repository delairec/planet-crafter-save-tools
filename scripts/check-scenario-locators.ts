import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {maskStringLiterals, readOwnSourceFiles, reportViolations} from './specSources.ts';

const SCENARIO_FILES_PATTERN = '**/*.e2e.ts';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;
const SCENARIO_EXTENSION = /\.e2e\.ts$/;

const ACCESSIBILITY_LOCATOR = /\bgetBy(?:Role|Label|Text|Placeholder|AltText|Title)\s*\(/;
const SELECTOR_QUERY = /\.locator\s*\(|\bquerySelector(?:All)?\s*\(|\bwaitForSelector\s*\(|\bframeLocator\s*\(/;
const SELECTOR_TAKING_PAGE_ACTION = /\bpage\s*\.\s*(?:\$\$?(?:eval)?|click|dblclick|fill|focus|hover|type|press|check|uncheck|selectOption|setInputFiles|setChecked|inputValue|dragAndDrop|textContent|innerText|innerHTML|getAttribute|isVisible|isHidden|isEnabled|isDisabled|isChecked|isEditable|tap|dispatchEvent)\s*\(/;
const REFERENCE_SCREENSHOT = /\btoHaveScreenshot\s*\(|\btoMatchSnapshot\s*\(|\.screenshot\s*\(/;

const ACCESSIBILITY_LOCATOR_REASON = 'a scenario designates an element by its test id, never by its role, its label or its text';
const CSS_SELECTOR_REASON = 'a scenario designates an element by its test id, never by a CSS selector';
const REFERENCE_SCREENSHOT_REASON = 'a scenario asserts what the screen shows in words, never against a reference screenshot';

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
 * @param {string} source the whole content of a scenario file
 * @returns every line designating an element by something other than its test id
 */
export function findScenarioLocatorViolations(source: string): ScenarioLocatorViolation[] {
  return source.split('\n').flatMap((text, lineIndex) => {
    const code = maskStringLiterals(text);
    const line = lineIndex + 1;
    const designatesByCssSelector = SELECTOR_QUERY.test(code) || SELECTOR_TAKING_PAGE_ACTION.test(code);
    return [
      ...ACCESSIBILITY_LOCATOR.test(code) ? [{line, reason: ACCESSIBILITY_LOCATOR_REASON}] : [],
      ...designatesByCssSelector ? [{line, reason: CSS_SELECTOR_REASON}] : [],
      ...REFERENCE_SCREENSHOT.test(code) ? [{line, reason: REFERENCE_SCREENSHOT_REASON}] : []
    ];
  });
}

export async function checkScenarioLocators(io: ScriptIo): Promise<void> {
  const violations: string[] = [];
  for await (const {filePath, source} of readOwnSourceFiles(io, SCENARIO_FILES_PATTERN)) {
    if (!isScenarioFile(filePath)) {
      continue;
    }
    findScenarioLocatorViolations(source)
      .forEach(({line, reason}) => violations.push(`${filePath}:${line}\n  ${reason}`));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no scenario designates an element by something other than its test id.',
    summarize: count => `${count} line(s) designating an element by something other than its test id.`
  });
}

await runAsEntryPoint(import.meta.main, checkScenarioLocators);
