import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {isOwnSourceFile, reportViolations} from './specSources.ts';

const COLORS_FILE_PATH = 'packages/ui-save-manager/src/styles/colors.css';
const STYLESHEET_FILES_PATTERN = 'packages/ui-save-manager/src/**/*.css';

const CHECK_NAME = 'check:contrast';

const ROOT_BLOCK_PATTERN = /:root\s*{([^}]*)}/g;
const CUSTOM_PROPERTY_PATTERN = /--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g;
const DARK_SCHEME_MARKER = '@media (prefers-color-scheme: dark)';

const FOREGROUND_DECLARATION_PATTERN = /(?<![\w-])color\s*:([^;}]*)/g;
const TOKEN_REFERENCE_PATTERN = /^var\(--([\w-]+)\)$/;
const COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
const RULE_BOUNDARIES = ['}', '{', ';'];

export const MINIMUM_CONTRAST_RATIO = 4.5;

export type ThemeName = 'light' | 'dark';

export interface ThemeTokens {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export interface TokenPair {
  /** what a reader sees, in one line */
  description: string;
  /** the stylesheet declaring the foreground color, for the coverage check and the violation message */
  file: string;
  /** the selector citation printed in a violation message */
  selector: string;
  foreground: string;
  background: string;
}

/**
 * Every place a stylesheet of `packages/ui-save-manager/src/` sets a text color, paired with the
 * background it renders against.
 */
export const TOKEN_PAIRS: TokenPair[] = [
  {
    description: 'page body text on the page background',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: 'body',
    foreground: 'content',
    background: 'canvas'
  },
  {
    description: 'inline code, and a validation message it holds, on its panel',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: 'code',
    foreground: 'muted',
    background: 'elevated'
  },
  {
    description: 'the tooltip that names an icon-only button, on its panel',
    file: 'packages/ui-save-manager/src/styles/buttons.css',
    selector: '.tooltip',
    foreground: 'content',
    background: 'elevated'
  },
  {
    description: 'the icon of an icon-only button, drawn without a fill on the page background',
    file: 'packages/ui-save-manager/src/styles/buttons.css',
    selector: '.icon-button button',
    foreground: 'muted',
    background: 'canvas'
  },
  {
    description: 'the icon of an icon-only button under the pointer, on its hover panel',
    file: 'packages/ui-save-manager/src/styles/buttons.css',
    selector: '.icon-button :enabled:hover',
    foreground: 'content',
    background: 'elevated'
  },
  {
    description: 'the text of a limitation notification, inherited from the body, on its surface',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: '.notification-limitation',
    foreground: 'content',
    background: 'limitation-surface'
  },
  {
    description: 'the text of a warning notification, inherited from the body, on its surface',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: '.notification-warning',
    foreground: 'content',
    background: 'warning-surface'
  },
  {
    description: 'the text of an information notification, inherited from the body, on its surface',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: '.notification-information',
    foreground: 'content',
    background: 'information-surface'
  },
  {
    description: 'the severity pill of a limitation notification, on its own surface',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: '.notification-limitation .notification-severity-pill',
    foreground: 'limitation',
    background: 'surface'
  },
  {
    description: 'the severity pill of a warning notification, on its own surface',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: '.notification-warning .notification-severity-pill',
    foreground: 'warning',
    background: 'surface'
  },
  {
    description: 'the severity pill of an information notification, on its own surface',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: '.notification-information .notification-severity-pill',
    foreground: 'information',
    background: 'surface'
  },
  {
    description: 'a validation message origin, nested inside the code panel above',
    file: 'packages/ui-save-manager/src/styles/layout.css',
    selector: '.validation-message-location',
    foreground: 'subtle',
    background: 'elevated'
  },
  {
    description: 'a section heading on the page background',
    file: 'packages/ui-save-manager/src/styles/typography.css',
    selector: 'h3',
    foreground: 'neon-pink',
    background: 'canvas'
  },
  {
    description: 'a planet/section sub-heading on its own accent banner',
    file: 'packages/ui-save-manager/src/styles/typography.css',
    selector: 'h4',
    foreground: 'inverted',
    background: 'neon-cyan'
  },
  {
    description: 'a list marker, and a list item without a color of its own, on the page background',
    file: 'packages/ui-save-manager/src/styles/typography.css',
    selector: 'ul, ol',
    foreground: 'muted',
    background: 'canvas'
  },
  {
    description: 'a loading or placeholder message on the page background',
    file: 'packages/ui-save-manager/src/styles/typography.css',
    selector: '.text-color-muted',
    foreground: 'muted',
    background: 'canvas'
  },
  {
    description: 'a success message on the page background',
    file: 'packages/ui-save-manager/src/styles/typography.css',
    selector: '.text-color-success',
    foreground: 'success',
    background: 'canvas'
  },
  {
    description: 'a warning message on the page background',
    file: 'packages/ui-save-manager/src/styles/typography.css',
    selector: '.text-color-warning',
    foreground: 'warning',
    background: 'canvas'
  },
  {
    description: 'an error message on the page background',
    file: 'packages/ui-save-manager/src/styles/typography.css',
    selector: '.text-color-danger',
    foreground: 'danger',
    background: 'canvas'
  },
  {
    description: 'a button label on the idle fill of a button, the accent darkened',
    file: 'packages/ui-save-manager/src/styles/buttons.css',
    selector: 'button, .button-link',
    foreground: 'inverted',
    background: 'primary-idle'
  },
  {
    description: 'a button label under the pointer, on the accent fill',
    file: 'packages/ui-save-manager/src/styles/buttons.css',
    selector: 'button:hover, .button-link:hover',
    foreground: 'inverted',
    background: 'primary'
  },
  {
    description: 'a form field value on its input surface',
    file: 'packages/ui-save-manager/src/styles/forms.css',
    selector: 'input, textarea, select',
    foreground: 'content',
    background: 'surface'
  },
  {
    description: 'a read-only field label on the panel surface it is nested in',
    file: 'packages/ui-save-manager/src/styles/forms.css',
    selector: '.fields-group .label',
    foreground: 'primary',
    background: 'surface'
  },
  {
    description: 'a terraformation index or biomass value, nested inside a grid tile',
    file: 'packages/ui-save-manager/src/styles/forms.css',
    selector: '.fields-group-main-value span',
    foreground: 'neon-purple',
    background: 'elevated'
  },
  {
    description: 'the text-selection highlight, on the accent fill',
    file: 'packages/ui-save-manager/src/styles/effects.css',
    selector: '::selection',
    foreground: 'inverted',
    background: 'primary'
  },
  {
    description: 'the loading spinner label on the page background',
    file: 'packages/ui-save-manager/src/styles/effects.css',
    selector: '.spinner-container',
    foreground: 'muted',
    background: 'canvas'
  },
  {
    description: 'the title of a group of the menu, on the menu panel',
    file: 'packages/ui-save-manager/src/styles/shell/menu.css',
    selector: '.menu-group-title',
    foreground: 'neon-purple',
    background: 'surface'
  },
  {
    description: 'a link of the menu, on the menu panel',
    file: 'packages/ui-save-manager/src/styles/shell/menu.css',
    selector: '.menu a',
    foreground: 'content',
    background: 'surface'
  },
  {
    description: 'the menu link of the open page, on its neon fill',
    file: 'packages/ui-save-manager/src/styles/shell/menu.css',
    selector: '.menu a[aria-current="page"]',
    foreground: 'inverted',
    background: 'neon-cyan'
  },
  {
    description: 'the file name of the loaded save, in the identity zone of the menu panel',
    file: 'packages/ui-save-manager/src/styles/shell/menu.css',
    selector: '.menu-identity-file',
    foreground: 'content',
    background: 'surface'
  },
  {
    description: 'the display name, mode and game release of the loaded save, on the menu panel',
    file: 'packages/ui-save-manager/src/styles/shell/menu.css',
    selector: '.menu-identity-detail',
    foreground: 'muted',
    background: 'surface'
  },
  {
    description: 'the name of a player in the Players group, on the menu panel',
    file: 'packages/ui-save-manager/src/styles/shell/menu.css',
    selector: '.menu-player',
    foreground: 'content',
    background: 'surface'
  },
  {
    description: 'the planet a player stands on, in the Players group of the menu panel',
    file: 'packages/ui-save-manager/src/styles/shell/menu.css',
    selector: '.menu-player-planet',
    foreground: 'muted',
    background: 'surface'
  },
  {
    description: 'the Host badge of a player, on its neon fill',
    file: 'packages/ui-save-manager/src/styles/components.css',
    selector: '.host-badge',
    foreground: 'inverted',
    background: 'neon-purple'
  },
  {
    description: 'the open page of the breadcrumb, on the page background',
    file: 'packages/ui-save-manager/src/styles/shell/breadcrumb.css',
    selector: '.breadcrumb-page',
    foreground: 'content',
    background: 'canvas'
  },
  {
    description: 'the summary figure of a card header, on the neon-cyan pill of that header',
    file: 'packages/ui-save-manager/src/styles/components.css',
    selector: '.card-summary',
    foreground: 'inverted',
    background: 'neon-cyan'
  },
  {
    description: 'a label of a key and value list, on a card',
    file: 'packages/ui-save-manager/src/styles/components.css',
    selector: '.key-value dt',
    foreground: 'muted',
    background: 'surface-card'
  },
  {
    description: 'a tone badge at the game default, on its neutral fill',
    file: 'packages/ui-save-manager/src/styles/components.css',
    selector: '.tone-badge-neutral',
    foreground: 'muted',
    background: 'elevated'
  },
  {
    description: 'a tone badge that penalises the player, on its danger fill',
    file: 'packages/ui-save-manager/src/styles/components.css',
    selector: '.tone-badge-danger',
    foreground: 'danger-on-surface',
    background: 'danger-surface'
  },
  {
    description: 'a tone badge that helps the player, on its positive fill',
    file: 'packages/ui-save-manager/src/styles/components.css',
    selector: '.tone-badge-positive',
    foreground: 'positive-on-surface',
    background: 'positive-surface'
  },
  {
    description: 'an on pill of an unlock flag, on its positive fill',
    file: 'packages/ui-save-manager/src/styles/components.css',
    selector: '.on-off-pill-on',
    foreground: 'positive-on-surface',
    background: 'positive-surface'
  },
  {
    description: 'an off pill of an unlock flag, on its neutral fill',
    file: 'packages/ui-save-manager/src/styles/components.css',
    selector: '.on-off-pill-off',
    foreground: 'muted',
    background: 'elevated'
  },
  {
    description: 'the application title, a link to the home page, on the page background',
    file: 'packages/ui-save-manager/src/styles/shell/shell.css',
    selector: '.application-title-link',
    foreground: 'content',
    background: 'canvas'
  }
];

/**
 * @param {string} source the whole content of colors.css
 * @returns the custom properties of the plain `:root` block and of the one nested under
 * `@media (prefers-color-scheme: dark)`, by theme
 */
export function parseColorTokens(source: string): ThemeTokens {
  const darkSchemeIndex = source.indexOf(DARK_SCHEME_MARKER);
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  for (const rootMatch of source.matchAll(ROOT_BLOCK_PATTERN)) {
    const isDarkBlock = darkSchemeIndex !== -1 && (rootMatch.index ?? 0) > darkSchemeIndex;
    const target = isDarkBlock ? dark : light;
    for (const propertyMatch of rootMatch[1].matchAll(CUSTOM_PROPERTY_PATTERN)) {
      target[propertyMatch[1]] = propertyMatch[2];
    }
  }
  return {light, dark};
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  const value = normalized.slice(1, 7);
  return [0, 2, 4].map(offset => parseInt(value.slice(offset, offset + 2), 16)) as [number, number, number];
}

function srgbChannelToLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map(srgbChannelToLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * The WCAG 2.1 contrast ratio of two colors, order-independent, from 1 (identical) to 21 (black on white).
 * @param {string} first a `#rgb`/`#rrggbb` color
 * @param {string} second a `#rgb`/`#rrggbb` color
 */
export function contrastRatio(first: string, second: string): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * @param {TokenPair[]} pairs the catalog to check
 * @param {ThemeTokens} tokens the color tokens read from colors.css
 * @param {number} minimumRatio the WCAG floor a pair must reach in both themes
 * @returns one violation per pair that misses the floor, or whose token is undeclared, in either theme
 */
export function findContrastViolations(pairs: TokenPair[], tokens: ThemeTokens, minimumRatio: number): string[] {
  const themes: [ThemeName, Record<string, string>][] = [['light', tokens.light], ['dark', tokens.dark]];
  return pairs.flatMap(pair => themes.flatMap(([themeName, themeTokens]) => {
    const foregroundHex = themeTokens[pair.foreground];
    const backgroundHex = themeTokens[pair.background];
    if (!foregroundHex || !backgroundHex) {
      const missing = !foregroundHex ? pair.foreground : pair.background;
      return [`${pair.file}: ${pair.selector} — --${missing} is not declared in the ${themeName} theme`];
    }
    const ratio = contrastRatio(foregroundHex, backgroundHex);
    if (ratio >= minimumRatio) {
      return [];
    }
    return [`${pair.file}: ${pair.selector} (${themeName} theme) — ${pair.description}: --${pair.foreground} on --${pair.background} is ${ratio.toFixed(2)}:1, below the WCAG 2.1 AA floor of ${minimumRatio}:1`];
  }));
}

/**
 * @param {string} source a stylesheet
 * @returns the stylesheet with every comment replaced by spaces of the same length, its newlines kept
 */
function maskComments(source: string): string {
  return source.replace(COMMENT_PATTERN, comment => comment.replace(/[^\n]/g, ' '));
}

/**
 * @param {string} selector a selector or a selector list, as written in a stylesheet
 * @returns each selector of the list, trimmed and with its whitespace collapsed
 */
function splitSelectorList(selector: string): string[] {
  return selector.split(',').map(part => part.trim().replace(/\s+/g, ' ')).filter(part => part.length > 0);
}

/**
 * @param {string} maskedSource a stylesheet whose comments are masked
 * @param {number} declarationIndex the offset of a declaration inside it
 * @returns the selectors of the rule enclosing that declaration
 */
function readEnclosingSelectors(maskedSource: string, declarationIndex: number): string[] {
  const ruleOpeningIndex = maskedSource.lastIndexOf('{', declarationIndex);
  const selectorStartIndex = Math.max(...RULE_BOUNDARIES.map(boundary => maskedSource.lastIndexOf(boundary, ruleOpeningIndex - 1))) + 1;
  return splitSelectorList(maskedSource.slice(selectorStartIndex, ruleOpeningIndex));
}

/**
 * @param {TokenPair[]} filePairs the pairs catalogued for the stylesheet declaring the color
 * @param {string} token the foreground token the declaration names
 * @param {string[]} ruleSelectors the selectors of the rule holding the declaration
 * @returns whether one pair names that token for every one of those selectors, and so states their background
 */
function isCoveredByCatalog(filePairs: TokenPair[], token: string, ruleSelectors: string[]): boolean {
  return filePairs.some(pair => {
    const pairSelectors = splitSelectorList(pair.selector);
    return pair.foreground === token && ruleSelectors.every(selector => pairSelectors.includes(selector));
  });
}

/**
 * @param {string} source the whole content of one stylesheet of `packages/ui-save-manager/src/`
 * @param {string} filePath that stylesheet's path, matching a `TokenPair.file`
 * @param {TokenPair[]} pairs the catalog every foreground declaration must appear in
 * @returns one violation per `color:` declaration that names no token, or whose token and selector no pair of the
 * file covers
 */
export function findUncataloguedForegroundDeclarations(source: string, filePath: string, pairs: TokenPair[]): string[] {
  const maskedSource = maskComments(source);
  const filePairs = pairs.filter(pair => pair.file === filePath);
  const violations: string[] = [];
  for (const match of maskedSource.matchAll(FOREGROUND_DECLARATION_PATTERN)) {
    const declarationIndex = match.index ?? 0;
    const line = maskedSource.slice(0, declarationIndex).split('\n').length;
    const ruleSelectors = readEnclosingSelectors(maskedSource, declarationIndex);
    const printedSelector = ruleSelectors.join(', ');
    const value = match[1].trim();
    const tokenReference = TOKEN_REFERENCE_PATTERN.exec(value);
    if (!tokenReference) {
      violations.push(`${filePath}:${line}: '${printedSelector} { color: ${value} }' names no color token; write it var(--token) from colors.css`);
      continue;
    }
    const token = tokenReference[1];
    if (!isCoveredByCatalog(filePairs, token, ruleSelectors)) {
      violations.push(`${filePath}:${line}: '${printedSelector} { color: var(--${token}) }' has no entry in TOKEN_PAIRS of scripts/check-color-contrast.ts`);
    }
  }
  return violations;
}

/**
 * @param io
 * @returns every foreground violation of the stylesheets of `packages/ui-save-manager/src/`, generated ones excluded,
 * each cited by its path relative to the workspace root
 */
async function findForegroundViolationsInStylesheets(io: ScriptIo): Promise<string[]> {
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(STYLESHEET_FILES_PATTERN)) {
    if (!isOwnSourceFile(filePath)) {
      continue;
    }
    const source = await io.readText(filePath);
    violations.push(...findUncataloguedForegroundDeclarations(source, filePath, TOKEN_PAIRS));
  }
  return violations;
}

export async function checkColorContrast(io: ScriptIo): Promise<void> {
  const tokens = parseColorTokens(await io.readText(COLORS_FILE_PATH));
  const violations = [
    ...findContrastViolations(TOKEN_PAIRS, tokens, MINIMUM_CONTRAST_RATIO),
    ...await findForegroundViolationsInStylesheets(io)
  ];

  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'every catalogued text/background pair meets WCAG 2.1 AA (4.5:1) in both themes.',
    summarize: count => `${count} color contrast violation(s); see @DECISION.ColorTokenPairsMeetWcagAaByCatalog.`
  });
}

await runAsEntryPoint(import.meta.main, checkColorContrast);
