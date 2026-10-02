import {runAsEntryPoint, type ScriptIo} from '../../common/scriptIo.ts';
import {reportViolations} from '../common/specSources.ts';

const SOURCE_FILES_PATTERN = 'packages/*/**/*.{js,ts,tsx}';
const GENERATED_DIRECTORY = /(?:^|\/)(?:node_modules|dist|build|coverage|\.output|\.vinxi)\//;
const DOMAIN_FILE = /^packages\/core-[^/]+\/(?:.*\/)?domain\//;

const WIRE_ABBREVIATIONS = ['gId', 'liId', 'woIds', 'siIds', 'linkedWo'];
const WIRE_ABBREVIATION_PATTERN = new RegExp(`\\b(?:${WIRE_ABBREVIATIONS.join('|')})\\b`, 'g');

const CHECK_NAME = 'check:wire-format';
const ABBREVIATION_REASON = 'the domain names the business concept, never the save format abbreviation: translate it at the domain boundary';

export interface WireFormatFinding {
  line: number;
  found: string;
  reason: string;
}

interface StringLiteral {
  start: number;
  end: number;
  value: string;
}

interface ScannedSource {
  code: string;
  stringLiterals: StringLiteral[];
}

type BraceKind = 'block' | 'substitution';

interface ScanState {
  source: string;
  code: string[];
  stringLiterals: StringLiteral[];
  braces: BraceKind[];
}

function blank(characters: string[], from: number, to: number): void {
  for (let index = from; index < to; index++) {
    if (characters[index] !== '\n') {
      characters[index] = ' ';
    }
  }
}

function findLineEnd(source: string, from: number): number {
  const newlineIndex = source.indexOf('\n', from);
  return newlineIndex === -1 ? source.length : newlineIndex;
}

function findBlockCommentEnd(source: string, from: number): number {
  const closingIndex = source.indexOf('*/', from + 2);
  return closingIndex === -1 ? source.length : closingIndex + 2;
}

function findStringClosing(source: string, from: number, quote: string): number {
  let index = from;
  while (index < source.length && source[index] !== quote && source[index] !== '\n') {
    index += source[index] === '\\' ? 2 : 1;
  }
  return Math.min(index, source.length);
}

function scanComment(state: ScanState, from: number, end: number): number {
  blank(state.code, from, end);
  return end;
}

function scanString(state: ScanState, from: number): number {
  const closingIndex = findStringClosing(state.source, from + 1, state.source[from]!);
  const end = state.source[closingIndex] === state.source[from] ? closingIndex + 1 : closingIndex;
  state.stringLiterals.push({start: from, end, value: state.source.slice(from + 1, closingIndex)});
  blank(state.code, from + 1, closingIndex);
  return end;
}

function scanTemplate(state: ScanState, from: number): number {
  let index = from;
  while (index < state.source.length) {
    if (state.source[index] === '`') {
      return index + 1;
    }
    if (state.source[index] === '$' && state.source[index + 1] === '{') {
      state.braces.push('substitution');
      return index + 2;
    }
    const width = state.source[index] === '\\' ? 2 : 1;
    blank(state.code, index, index + width);
    index += width;
  }
  return state.source.length;
}

function scanBrace(state: ScanState, index: number): number {
  if (state.source[index] === '{') {
    state.braces.push('block');
    return index + 1;
  }
  return state.braces.pop() === 'substitution' ? scanTemplate(state, index + 1) : index + 1;
}

function scanSlash(state: ScanState, index: number): number {
  const next = state.source[index + 1];
  if (next === '/') {
    return scanComment(state, index, findLineEnd(state.source, index));
  }
  if (next === '*') {
    return scanComment(state, index, findBlockCommentEnd(state.source, index));
  }
  return index + 1;
}

const TOKEN_SCANNERS: Record<string, (state: ScanState, index: number) => number> = {
  '/': scanSlash,
  "'": scanString,
  '"': scanString,
  '`': (state, index) => scanTemplate(state, index + 1),
  '{': scanBrace,
  '}': scanBrace
};

function scanToken(state: ScanState, index: number): number {
  const scanner = TOKEN_SCANNERS[state.source[index]!];
  return scanner === undefined ? index + 1 : scanner(state, index);
}

function scanSource(source: string): ScannedSource {
  const state: ScanState = {
    source,
    code: source.split(''),
    stringLiterals: [],
    braces: []
  };
  let index = 0;
  while (index < source.length) {
    index = scanToken(state, index);
  }
  return {
    code: state.code.join(''),
    stringLiterals: state.stringLiterals
  };
}

function countLine(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length;
}

function isDomainFile(filePath: string): boolean {
  return DOMAIN_FILE.test(filePath) && !GENERATED_DIRECTORY.test(filePath);
}

function isKeyPosition(code: string, {start, end}: StringLiteral): boolean {
  const before = code.slice(0, start).trimEnd();
  const after = code.slice(end).trimStart();
  return after.startsWith(':') || after.startsWith('?:') || (before.endsWith('[') && after.startsWith(']'));
}

function findCodeAbbreviations(code: string): {offset: number; found: string}[] {
  return Array.from(code.matchAll(WIRE_ABBREVIATION_PATTERN), match => ({offset: match.index, found: match[0]}));
}

function findKeyAbbreviations({code, stringLiterals}: ScannedSource): {offset: number; found: string}[] {
  return stringLiterals
    .filter(literal => WIRE_ABBREVIATIONS.includes(literal.value) && isKeyPosition(code, literal))
    .map(literal => ({offset: literal.start, found: literal.value}));
}

export function findWireAbbreviations(filePath: string, source: string): WireFormatFinding[] {
  if (!isDomainFile(filePath)) {
    return [];
  }
  const scanned = scanSource(source);
  return [...findCodeAbbreviations(scanned.code), ...findKeyAbbreviations(scanned)]
    .sort((left, right) => left.offset - right.offset)
    .map(({offset, found}) => ({line: countLine(source, offset), found, reason: ABBREVIATION_REASON}));
}

function formatFindings(filePath: string, findings: WireFormatFinding[]): string[] {
  return findings.map(({line, found, reason}) => `${filePath}:${line}: ${found}\n  ${reason}`);
}

export async function checkWireFormat(io: ScriptIo): Promise<void> {
  const violations: string[] = [];
  for await (const filePath of io.scanFiles(SOURCE_FILES_PATTERN)) {
    violations.push(...formatFindings(filePath, findWireAbbreviations(filePath, await io.readText(filePath))));
  }
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations,
    nothingFound: 'no domain file names a save format abbreviation.',
    summarize: count => `${count} violation(s): a domain file names no save format abbreviation (${WIRE_ABBREVIATIONS.join(', ')}).`
  });
}

await runAsEntryPoint(import.meta.main, checkWireFormat);
