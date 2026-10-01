const STATIC_STATEMENT = /(?<=^|[;}])[ \t]*(?:import|export)\b[^;'"`]*?\bfrom\s*(['"])([^'"]+)\1/dgm;
const SIDE_EFFECT_IMPORT = /(?<=^|[;}])[ \t]*import\s*(['"])([^'"]+)\1/dgm;
const DYNAMIC_IMPORT = /\bimport\(\s*(['"`])([^'"`]+)\1\s*[,)]/dg;
const REQUIRE_CALL = /\brequire\(\s*(['"`])([^'"`]+)\1\s*[,)]/dg;
const JSDOC_IMPORT = /@import\b[^'"]*?\bfrom\s*(['"])([^'"]+)\1/dg;
const JSDOC_TYPE_IMPORT = /\bimport\(\s*(['"])([^'"]+)\1\s*\)/dg;
const TEMPLATE_SUBSTITUTION = '${';
const WORD_CHARACTER = /[\w$]/;
const WHITESPACE = /\s/;
const EXPRESSION_PUNCTUATORS = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^']);
const EXPRESSION_KEYWORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'instanceof']);
const NO_CLOSING_SLASH = -1;

export interface ImportStatement {
  line: number;
  specifier: string;
}

interface LocatedSpecifier {
  offset: number;
  specifier: string;
}

interface LexedSource {
  code: string;
  comments: string;
}

type CharacterRole = 'code' | 'literal' | 'comment';

interface LexerState {
  source: string;
  code: string[];
  comments: string[];
  offset: number;
  previousToken: string;
  braceDepth: number;
  substitutionDepths: number[];
}

function writeInCode(character: string, role: CharacterRole): string {
  if (character === '\n' || role === 'code') {
    return character;
  }
  return role === 'literal' ? '_' : ' ';
}

function writeInComments(character: string, role: CharacterRole): string {
  return character === '\n' || role === 'comment' ? character : ' ';
}

function consumeCharacters(state: LexerState, role: CharacterRole, count = 1): void {
  const end = Math.min(state.offset + count, state.source.length);
  while (state.offset < end) {
    const character = state.source[state.offset]!;
    state.code.push(writeInCode(character, role));
    state.comments.push(writeInComments(character, role));
    state.offset++;
  }
}

function lexLineComment(state: LexerState): void {
  while (state.offset < state.source.length && state.source[state.offset] !== '\n') {
    consumeCharacters(state, 'comment');
  }
}

function lexBlockComment(state: LexerState): void {
  const closing = state.source.indexOf('*/', state.offset + 2);
  const end = closing === -1 ? state.source.length : closing + 2;
  consumeCharacters(state, 'comment', end - state.offset);
}

function lexString(state: LexerState): void {
  const quote = state.source[state.offset]!;
  consumeCharacters(state, 'code');
  while (state.offset < state.source.length) {
    const character = state.source[state.offset];
    if (character === '\n') {
      break;
    }
    if (character === quote) {
      consumeCharacters(state, 'code');
      break;
    }
    consumeCharacters(state, 'literal', character === '\\' ? 2 : 1);
  }
  state.previousToken = quote;
}

function lexTemplateLiteral(state: LexerState): void {
  while (state.offset < state.source.length) {
    const character = state.source[state.offset];
    if (character === '`') {
      consumeCharacters(state, 'code');
      state.previousToken = character;
      return;
    }
    if (character === '$' && state.source[state.offset + 1] === '{') {
      consumeCharacters(state, 'code', 2);
      state.substitutionDepths.push(state.braceDepth);
      state.previousToken = '{';
      return;
    }
    consumeCharacters(state, 'literal', character === '\\' ? 2 : 1);
  }
}

function findClosingSlash(source: string, opening: number): number {
  let insideClass = false;
  for (let offset = opening + 1; offset < source.length && source[offset] !== '\n'; offset++) {
    const character = source[offset];
    if (character === '\\') {
      offset++;
    } else if (character === '[') {
      insideClass = true;
    } else if (character === ']') {
      insideClass = false;
    } else if (character === '/' && !insideClass) {
      return offset;
    }
  }
  return NO_CLOSING_SLASH;
}

function isExpressionStart(previousToken: string): boolean {
  return previousToken === '' || EXPRESSION_PUNCTUATORS.has(previousToken) || EXPRESSION_KEYWORDS.has(previousToken);
}

function lexSlash(state: LexerState): void {
  const opening = state.offset;
  const closing = isExpressionStart(state.previousToken) ? findClosingSlash(state.source, opening) : NO_CLOSING_SLASH;
  if (closing === NO_CLOSING_SLASH) {
    consumeCharacters(state, 'code');
    state.previousToken = '/';
    return;
  }
  consumeCharacters(state, 'code');
  consumeCharacters(state, 'literal', closing - opening - 1);
  consumeCharacters(state, 'code');
  state.previousToken = state.source.slice(opening, closing + 1);
}

function lexWord(state: LexerState): void {
  const start = state.offset;
  while (state.offset < state.source.length && WORD_CHARACTER.test(state.source[state.offset]!)) {
    consumeCharacters(state, 'code');
  }
  state.previousToken = state.source.slice(start, state.offset);
}

function lexOpeningBrace(state: LexerState): void {
  state.braceDepth++;
  consumeCharacters(state, 'code');
  state.previousToken = '{';
}

function lexClosingBrace(state: LexerState): void {
  consumeCharacters(state, 'code');
  if (state.substitutionDepths.at(-1) === state.braceDepth) {
    state.substitutionDepths.pop();
    lexTemplateLiteral(state);
    return;
  }
  state.braceDepth--;
  state.previousToken = '}';
}

function lexPunctuator(state: LexerState): void {
  state.previousToken = state.source[state.offset]!;
  consumeCharacters(state, 'code');
}

function lexSlashOrComment(state: LexerState): void {
  const next = state.source[state.offset + 1];
  if (next === '/') {
    lexLineComment(state);
  } else if (next === '*') {
    lexBlockComment(state);
  } else {
    lexSlash(state);
  }
}

function lexBackquote(state: LexerState): void {
  consumeCharacters(state, 'code');
  lexTemplateLiteral(state);
}

const LEXERS_BY_OPENING_CHARACTER = new Map<string, (state: LexerState) => void>([
  ['/', lexSlashOrComment],
  ['\'', lexString],
  ['"', lexString],
  ['`', lexBackquote],
  ['{', lexOpeningBrace],
  ['}', lexClosingBrace]
]);

function lexToken(state: LexerState): void {
  const character = state.source[state.offset]!;
  const lexFromOpeningCharacter = LEXERS_BY_OPENING_CHARACTER.get(character);
  if (lexFromOpeningCharacter) {
    lexFromOpeningCharacter(state);
  } else if (WHITESPACE.test(character)) {
    consumeCharacters(state, 'code');
  } else if (WORD_CHARACTER.test(character)) {
    lexWord(state);
  } else {
    lexPunctuator(state);
  }
}

function lexSource(source: string): LexedSource {
  const state: LexerState = {source, code: [], comments: [], offset: 0, previousToken: '', braceDepth: 0, substitutionDepths: []};
  while (state.offset < source.length) {
    lexToken(state);
  }
  return {code: state.code.join(''), comments: state.comments.join('')};
}

function matchSpecifiers(text: string, source: string, pattern: RegExp): LocatedSpecifier[] {
  return Array.from(text.matchAll(pattern))
    .filter(match => !text.slice(...match.indices![2]!).includes(TEMPLATE_SUBSTITUTION))
    .map(match => ({offset: match.index, specifier: source.slice(...match.indices![2]!)}));
}

function countLine(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length;
}

export function readImportStatements(source: string): ImportStatement[] {
  const {code, comments} = lexSource(source);
  return [
    ...matchSpecifiers(code, source, STATIC_STATEMENT),
    ...matchSpecifiers(code, source, SIDE_EFFECT_IMPORT),
    ...matchSpecifiers(code, source, DYNAMIC_IMPORT),
    ...matchSpecifiers(code, source, REQUIRE_CALL),
    ...matchSpecifiers(comments, source, JSDOC_IMPORT),
    ...matchSpecifiers(comments, source, JSDOC_TYPE_IMPORT)
  ]
    .sort((left, right) => left.offset - right.offset)
    .map(({offset, specifier}) => ({line: countLine(source, offset), specifier}));
}
