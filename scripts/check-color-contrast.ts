import {Glob} from 'bun';
import {reportViolations} from './specSources.ts';

const COLORS_FILE_PATH = 'packages/ui-save-manager/src/styles/colors.css';
const STYLESHEET_FILES_PATTERN = 'packages/ui-save-manager/src/styles/*.css';

const CHECK_NAME = 'check:contrast';

const ROOT_BLOCK_PATTERN = /:root\s*{([^}]*)}/g;
const CUSTOM_PROPERTY_PATTERN = /--([\w-]+):\s*(#[0-9a-fA-F]{3,8})\s*;/g;
const DARK_SCHEME_MARKER = '@media (prefers-color-scheme: dark)';

const FOREGROUND_DECLARATION_PATTERN = /(?<!-)color:\s*var\(--([\w-]+)\)/g;

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
 * Every place `packages/ui-save-manager/src/styles/` sets a text color, paired with the
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
    description: 'a button label, and the text-selection highlight, on the accent fill',
    file: 'packages/ui-save-manager/src/styles/buttons.css',
    selector: 'button, .button-link',
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
    selector: '.fields-group.readonly .field .label',
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
 * @param {string} source the whole content of one stylesheet of `packages/ui-save-manager/src/styles/`
 * @param {string} filePath that stylesheet's path, matching a `TokenPair.file`
 * @param {TokenPair[]} pairs the catalog every foreground declaration must appear in
 * @returns one violation per `color: var(--x)` declaration the catalog does not cover
 */
export function findUncataloguedForegroundDeclarations(source: string, filePath: string, pairs: TokenPair[]): string[] {
  const cataloguedForegrounds = new Set(pairs.filter(pair => pair.file === filePath).map(pair => pair.foreground));
  const violations: string[] = [];
  for (const match of source.matchAll(FOREGROUND_DECLARATION_PATTERN)) {
    const token = match[1];
    if (!cataloguedForegrounds.has(token)) {
      const line = source.slice(0, match.index).split('\n').length;
      violations.push(`${filePath}:${line}: 'color: var(--${token})' has no entry in TOKEN_PAIRS of scripts/check-color-contrast.ts`);
    }
  }
  return violations;
}

async function checkColorContrast(): Promise<number> {
  const tokens = parseColorTokens(await Bun.file(COLORS_FILE_PATH).text());
  const violations = findContrastViolations(TOKEN_PAIRS, tokens, MINIMUM_CONTRAST_RATIO);

  for await (const filePath of new Glob(STYLESHEET_FILES_PATTERN).scan({cwd: process.cwd()})) {
    const source = await Bun.file(filePath).text();
    violations.push(...findUncataloguedForegroundDeclarations(source, filePath, TOKEN_PAIRS));
  }

  return reportViolations({
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'every catalogued text/background pair meets WCAG 2.1 AA (4.5:1) in both themes.',
    summarize: count => `${count} color contrast violation(s); see @DECISION.ColorTokenPairsMeetWcagAaByCatalog.`
  });
}

if (import.meta.main) {
  process.exit(await checkColorContrast());
}
