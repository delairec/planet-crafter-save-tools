import {afterEach, beforeEach, describe, expect, it} from 'bun:test';
import {mkdir, mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {
  contrastRatio,
  findContrastViolations,
  findForegroundViolationsInStylesheets,
  findUncataloguedForegroundDeclarations,
  parseColorTokens,
  type TokenPair
} from './check-color-contrast.ts';

describe('parseColorTokens', () => {

  describe('When a stylesheet declares a plain :root and a dark-scheme one', () => {
    it('should split the custom properties by theme', () => {
      // Arrange
      const source = [
        ':root {',
        '    --canvas: #ffffff;',
        '    --content: #111111;',
        '}',
        '',
        '@media (prefers-color-scheme: dark) {',
        '    :root {',
        '        --canvas: #000000;',
        '        --content: #eeeeee;',
        '    }',
        '}'
      ].join('\n');

      // Act
      const tokens = parseColorTokens(source);

      // Assert
      expect(tokens.light).toEqual({canvas: '#ffffff', content: '#111111'});
      expect(tokens.dark).toEqual({canvas: '#000000', content: '#eeeeee'});
    });
  });

  describe('When a stylesheet declares only the plain :root', () => {
    it('should leave the dark theme empty', () => {
      // Arrange
      const source = ':root {\n    --canvas: #ffffff;\n}';

      // Act
      const tokens = parseColorTokens(source);

      // Assert
      expect(tokens.light).toEqual({canvas: '#ffffff'});
      expect(tokens.dark).toEqual({});
    });
  });
});

describe('contrastRatio', () => {

  describe('When the two colors are black and white', () => {
    it('should return the maximum WCAG ratio', () => {
      // Act
      const ratio = contrastRatio('#000000', '#ffffff');

      // Assert
      expect(ratio).toBeCloseTo(21, 0);
    });
  });

  describe('When the two colors are identical', () => {
    it('should return 1', () => {
      // Act
      const ratio = contrastRatio('#5b7cfa', '#5b7cfa');

      // Assert
      expect(ratio).toBeCloseTo(1, 5);
    });
  });

  describe('When the arguments are swapped', () => {
    it('should return the same ratio, order not carrying meaning', () => {
      // Act
      const foregroundFirst = contrastRatio('#0f1226', '#f4f6fd');
      const backgroundFirst = contrastRatio('#f4f6fd', '#0f1226');

      // Assert
      expect(foregroundFirst).toBeCloseTo(backgroundFirst, 10);
    });
  });
});

describe('findContrastViolations', () => {

  const pair: TokenPair = {
    description: 'sample text on its panel',
    file: 'packages/ui-save-manager/src/styles/sample.css',
    selector: '.sample',
    foreground: 'content',
    background: 'canvas'
  };

  describe('When a pair meets the floor in both themes', () => {
    it('should report nothing', () => {
      // Arrange
      const tokens = {
        light: {content: '#0f1226', canvas: '#ffffff'},
        dark: {content: '#f1f3ff', canvas: '#0a0d1a'}
      };

      // Act
      const violations = findContrastViolations([pair], tokens, 4.5);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a pair misses the floor in one theme only', () => {
    it('should report that theme alone', () => {
      // Arrange
      const tokens = {
        light: {content: '#dddddd', canvas: '#ffffff'}, // light gray on white: unreadable
        dark: {content: '#f1f3ff', canvas: '#0a0d1a'}
      };

      // Act
      const violations = findContrastViolations([pair], tokens, 4.5);

      // Assert
      expect(violations).toHaveLength(1);
      expect(violations[0]).toContain('light theme');
      expect(violations[0]).toContain('.sample');
    });
  });

  describe('When a theme is missing one of the two tokens', () => {
    it('should report the missing token instead of computing a ratio', () => {
      // Arrange
      const tokens = {
        light: {content: '#0f1226', canvas: '#ffffff'},
        dark: {content: '#f1f3ff'} // canvas absent
      };

      // Act
      const violations = findContrastViolations([pair], tokens, 4.5);

      // Assert
      expect(violations).toEqual(['packages/ui-save-manager/src/styles/sample.css: .sample — --canvas is not declared in the dark theme']);
    });
  });
});

describe('findUncataloguedForegroundDeclarations', () => {

  const catalogued: TokenPair = {
    description: 'catalogued',
    file: 'packages/ui-save-manager/src/styles/sample.css',
    selector: '.known',
    foreground: 'content',
    background: 'canvas'
  };

  describe('When every color: declaration of the file is catalogued', () => {
    it('should report nothing', () => {
      // Arrange
      const source = '.known {\n    color: var(--content);\n}';

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, catalogued.file, [catalogued]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a color: declaration names a token absent from the catalog', () => {
    it('should report it with the file and line', () => {
      // Arrange
      const source = '.known {\n    color: var(--content);\n}\n\n.new-rule {\n    color: var(--danger);\n}';

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, catalogued.file, [catalogued]);

      // Assert
      expect(violations).toEqual([`${catalogued.file}:6: '.new-rule { color: var(--danger) }' has no entry in TOKEN_PAIRS of scripts/check-color-contrast.ts`]);
    });
  });

  describe('When the declaration is background-color, border-color or border-top-color', () => {
    it('should leave every one of them alone, none of them setting a text color', () => {
      // Arrange
      const source = [
        '.panel {',
        '    background-color: var(--surface);',
        '    border-color: var(--border);',
        '    border-top-color: var(--primary);',
        '}'
      ].join('\n');

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, catalogued.file, [catalogued]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When the same uncatalogued token is declared in a different file', () => {
    it('should still report it, coverage being tracked per file', () => {
      // Arrange
      const source = '.other {\n    color: var(--content);\n}';

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, 'packages/ui-save-manager/src/styles/other.css', [catalogued]);

      // Assert
      expect(violations).toEqual(["packages/ui-save-manager/src/styles/other.css:2: '.other { color: var(--content) }' has no entry in TOKEN_PAIRS of scripts/check-color-contrast.ts"]);
    });
  });

  describe('When a token catalogued for the file is declared under a selector no pair names', () => {
    it('should report it, the background of that selector being uncatalogued', () => {
      // Arrange
      const source = '.known {\n    color: var(--content);\n}\n\n.dead-class {\n    color: var(--content);\n}';

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, catalogued.file, [catalogued]);

      // Assert
      expect(violations).toEqual([`${catalogued.file}:6: '.dead-class { color: var(--content) }' has no entry in TOKEN_PAIRS of scripts/check-color-contrast.ts`]);
    });
  });

  describe('When the pair names a selector list and the stylesheet declares one of its selectors alone', () => {
    it('should report nothing', () => {
      // Arrange
      const listedPair: TokenPair = {...catalogued, selector: 'button, .button-link'};
      const source = '.button-link {\n    color: var(--content);\n}';

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, catalogued.file, [listedPair]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When the stylesheet writes a selector list over several lines', () => {
    it('should report nothing, the list matching the pair whatever its layout', () => {
      // Arrange
      const listedPair: TokenPair = {...catalogued, selector: 'input, textarea, select'};
      const source = 'input,\ntextarea,\nselect {\n    color: var(--content);\n}';

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, catalogued.file, [listedPair]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When the declaration sits in a rule nested in a media query, behind a comment', () => {
    it('should read the selector of the rule itself', () => {
      // Arrange
      const source = '@media (min-width: 40rem) {\n    /* wide screens */\n    .known {\n        color: var(--content);\n    }\n}';

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, catalogued.file, [catalogued]);

      // Assert
      expect(violations).toEqual([]);
    });
  });

  describe('When a color: declaration is written as a literal', () => {
    it.each([
      ['#ffffff'],
      ['white'],
      ['rgb(255, 255, 255)']
    ])('should report %s as naming no color token', literal => {
      // Arrange
      const source = `.known {\n    color: ${literal};\n}`;

      // Act
      const violations = findUncataloguedForegroundDeclarations(source, catalogued.file, [catalogued]);

      // Assert
      expect(violations).toEqual([`${catalogued.file}:2: '.known { color: ${literal} }' names no color token; write it var(--token) from colors.css`]);
    });
  });
});

describe('findForegroundViolationsInStylesheets', () => {

  let workspaceRoot: string;

  const writeWorkspaceFile = async (path: string, content: string) => {
    await mkdir(dirname(join(workspaceRoot, path)), {recursive: true});
    await writeFile(join(workspaceRoot, path), content);
  };

  beforeEach(async () => {
    workspaceRoot = await mkdtemp(join(tmpdir(), 'check-color-contrast-'));
  });

  afterEach(async () => {
    await rm(workspaceRoot, {recursive: true, force: true});
  });

  describe('When a stylesheet of the package sits outside styles/, app.css included', () => {
    it('should scan it like the stylesheets of styles/', async () => {
      // Arrange
      await writeWorkspaceFile('packages/ui-save-manager/src/app.css', '#app {\n    color: #ffffff;\n}');

      // Act
      const violations = await findForegroundViolationsInStylesheets(workspaceRoot);

      // Assert
      expect(violations).toEqual(["packages/ui-save-manager/src/app.css:2: '#app { color: #ffffff }' names no color token; write it var(--token) from colors.css"]);
    });
  });
});
