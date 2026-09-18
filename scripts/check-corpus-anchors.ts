import {Glob} from 'bun';
import {join} from 'node:path';
import {isOwnSourceFile, reportViolations} from './specSources.ts';

const CORPUS_FILES_PATTERN = '**/*.awawa';
const SCHEMA_KEYWORDS = new Set(['SCHEMA', 'FIELDSET', 'SHAPE']);
const INCLUDED_FIELDSET = /^@FIELDSET\.(\S+)$/;
const ANCHOR_TYPE = 'anchor';
const PATH_SEPARATOR = ' > ';
const FRAGMENT_SEPARATOR = '::';
const CHECK_NAME = 'check:anchors';

export type AnchorFields = Map<string, Set<string>>;

export interface CorpusAnchor {
  entity: string;
  field: string;
  path: string;
  line: number;
}

export interface UntrackedAnchor extends CorpusAnchor {
  file: string;
}

interface CorpusLine {
  depth: number;
  keyword: string;
  pieces: string[];
  line: number;
}

interface SchemaDeclaration {
  anchorPaths: string[];
  inclusions: {parentPath: string[], fieldset: string}[];
}

/**
 * @param {string} source the text of one or several corpus files
 * @returns every meaningful line, its continuation lines joined to it
 */
function readCorpusLines(source: string): CorpusLine[] {
  const corpusLines: CorpusLine[] = [];
  source.split('\n').forEach((text, lineIndex) => {
    const content = text.trim();
    if (content === '' || content.startsWith('//')) {
      return;
    }
    if (content.startsWith('+ ') && corpusLines.length > 0) {
      corpusLines[corpusLines.length - 1].pieces.push(content.slice(2).trim());
      return;
    }
    const [keyword, ...words] = content.split(/\s+/);
    corpusLines.push({
      depth: text.length - text.replace(/^\t+/, '').length,
      keyword,
      pieces: [words.join(' ')],
      line: lineIndex + 1
    });
  });
  return corpusLines;
}

/**
 * @param {string} piece a field value, quoted or not
 * @returns that value without its surrounding quotes
 */
function removeQuotes(piece: string): string {
  return piece.replace(/^"(.*)"$/, '$1');
}

/**
 * @param {(string | undefined)[]} ancestorFields the field name at each depth above the current line
 * @param {number} depth the depth of the current line
 * @returns the names of the fields enclosing that line, outermost first
 */
function listEnclosingFields(ancestorFields: (string | undefined)[], depth: number): string[] {
  return ancestorFields.slice(1, depth).filter((name): name is string => name !== undefined);
}

/**
 * @param {string} key the schema or fieldset whose anchors are resolved
 * @param {Map<string, SchemaDeclaration>} declarations every schema and fieldset of the corpus
 * @returns the path of every anchor field that declaration holds, its inclusions resolved
 */
function resolveAnchorPaths(key: string, declarations: Map<string, SchemaDeclaration>): string[] {
  const declaration = declarations.get(key);
  if (declaration === undefined) {
    return [];
  }
  return [
    ...declaration.anchorPaths,
    ...declaration.inclusions.flatMap(({parentPath, fieldset}) =>
      resolveAnchorPaths(`FIELDSET ${fieldset}`, declarations)
        .map(anchorPath => [...parentPath, anchorPath].join(PATH_SEPARATOR)))
  ];
}

/**
 * @param {string} corpusSource the text of the corpus files, the schema entries among them
 * @returns for each entity type, the path of every field its schema declares as an anchor
 */
export function readAnchorFields(corpusSource: string): AnchorFields {
  const declarations = new Map<string, SchemaDeclaration>();
  let declaration: SchemaDeclaration | undefined;
  const ancestorFields: (string | undefined)[] = [];
  for (const {depth, keyword, pieces} of readCorpusLines(corpusSource)) {
    const [name, type] = pieces[0].split(/\s+/);
    if (depth === 0) {
      declaration = keyword === 'SCHEMA' || keyword === 'FIELDSET' ? {anchorPaths: [], inclusions: []} : undefined;
      if (declaration !== undefined) {
        declarations.set(`${keyword} ${name}`, declaration);
      }
      continue;
    }
    ancestorFields[depth] = keyword === 'FIELD' ? name : undefined;
    ancestorFields.length = depth + 1;
    if (declaration === undefined) {
      continue;
    }
    const parentPath = listEnclosingFields(ancestorFields, depth);
    if (keyword === 'FIELD' && type !== undefined && type.split('|').includes(ANCHOR_TYPE)) {
      declaration.anchorPaths.push([...parentPath, name].join(PATH_SEPARATOR));
    }
    const includedFieldset = keyword === 'INCLUDE' ? INCLUDED_FIELDSET.exec(name) : null;
    if (includedFieldset !== null) {
      declaration.inclusions.push({parentPath, fieldset: includedFieldset[1]});
    }
  }
  const anchorFields: AnchorFields = new Map();
  for (const key of declarations.keys()) {
    const [keyword, type] = key.split(' ');
    const anchorPaths = resolveAnchorPaths(key, declarations);
    if (keyword === 'SCHEMA' && anchorPaths.length > 0) {
      anchorFields.set(type, new Set(anchorPaths));
    }
  }
  return anchorFields;
}

/**
 * @param {string} source the text of one corpus file
 * @param {AnchorFields} anchorFields the anchor fields the schema declares
 * @returns every anchor that file writes
 */
export function findCorpusAnchors(source: string, anchorFields: AnchorFields): CorpusAnchor[] {
  const anchors: CorpusAnchor[] = [];
  const everyEntityAnchors = anchorFields.get('*') ?? new Set<string>();
  let entity: string | undefined;
  let entityAnchors = new Set<string>();
  const ancestorFields: (string | undefined)[] = [];
  for (const {depth, keyword, pieces, line} of readCorpusLines(source)) {
    if (depth === 0) {
      entity = SCHEMA_KEYWORDS.has(keyword) ? undefined : `@${keyword}.${pieces[0]}`;
      entityAnchors = anchorFields.get(keyword) ?? new Set<string>();
      continue;
    }
    ancestorFields[depth] = keyword;
    ancestorFields.length = depth + 1;
    const field = [...listEnclosingFields(ancestorFields, depth), keyword].join(PATH_SEPARATOR);
    if (entity === undefined || !(entityAnchors.has(field) || everyEntityAnchors.has(field))) {
      continue;
    }
    const value = pieces.map(removeQuotes).join(' ');
    anchors.push({entity, field, path: value.split(FRAGMENT_SEPARATOR)[0], line});
  }
  return anchors;
}

/**
 * @param {string} workspaceRoot the root git lists the files of
 * @returns every file git tracks, relative to that root
 */
function listTrackedFiles(workspaceRoot: string): string[] {
  const listing = Bun.spawnSync(['git', 'ls-files', '-z'], {cwd: workspaceRoot});
  if (listing.exitCode !== 0) {
    throw new Error(listing.stderr.toString());
  }
  return listing.stdout.toString().split('\0').filter(trackedFile => trackedFile !== '');
}

/**
 * @param {string} anchorPath the path an anchor names
 * @param {string[]} trackedFiles every file git tracks
 * @returns whether that path is a tracked file or a directory holding one
 */
function isTracked(anchorPath: string, trackedFiles: string[]): boolean {
  const directoryPrefix = `${anchorPath.replace(/\/+$/, '')}/`;
  return trackedFiles.some(trackedFile => trackedFile === anchorPath || trackedFile.startsWith(directoryPrefix));
}

/**
 * @param {string} workspaceRoot the root the anchors of the corpus resolve from
 * @returns every anchor of the corpus naming a path git does not track
 */
export async function findUntrackedCorpusAnchors(workspaceRoot: string): Promise<UntrackedAnchor[]> {
  const corpusFiles: {file: string, source: string}[] = [];
  for await (const file of new Glob(CORPUS_FILES_PATTERN).scan({cwd: workspaceRoot})) {
    if (isOwnSourceFile(file)) {
      corpusFiles.push({file, source: await Bun.file(join(workspaceRoot, file)).text()});
    }
  }
  const anchorFields = readAnchorFields(corpusFiles.map(({source}) => source).join('\n'));
  const trackedFiles = listTrackedFiles(workspaceRoot);
  return corpusFiles
    .flatMap(({file, source}) => findCorpusAnchors(source, anchorFields)
      .filter(anchor => !isTracked(anchor.path, trackedFiles))
      .map(anchor => ({file, ...anchor})))
    .sort((first, second) => first.file.localeCompare(second.file) || first.line - second.line);
}

/**
 * @returns the exit code of the guard, once its report is printed
 */
async function checkCorpusAnchors(): Promise<number> {
  const untrackedAnchors = await findUntrackedCorpusAnchors(process.cwd());
  return reportViolations({
    checkName: CHECK_NAME,
    violations: untrackedAnchors.map(({file, line, entity, field, path}) =>
      `${file}:${line}\n  ${entity} ${field} names ${path}, a path git does not track`),
    nothingFound: 'every anchor of the corpus names a path git tracks.',
    summarize: count => `${count} anchor(s) naming a path git does not track.`
  });
}

if (import.meta.main) {
  process.exit(await checkCorpusAnchors());
}
