import {Glob} from 'bun';

const REGEXP_METACHARACTERS = /[.*+?^${}()|[\]\\]/g;
const NAME_CHARACTER_LOOKAHEAD = '(?![A-Za-z0-9_:])';
const CORPUS_FILES_PATTERN = 'docs/*.awawa';
const USAGE = 'usage: bun scripts/retype-entity.ts <FROM_TYPE> <TO_TYPE> <EntityName>';

export interface RetypeRequest {
  fromType: string;
  toType: string;
  name: string;
}

/**
 * @param {string} literal a value going into a regular expression as itself
 * @returns the same value with every metacharacter escaped
 */
function escapeForRegExp(literal: string): string {
  return literal.replace(REGEXP_METACHARACTERS, '\\$&');
}

/**
 * @param {string} source the whole content of a corpus file
 * @param {RetypeRequest} request the entity to retype, by its name and its two types
 * @returns the same content with the entity declaration and every reference site carrying the new type
 */
export function retypeEntity(source: string, request: RetypeRequest): string {
  const fromType = escapeForRegExp(request.fromType);
  const name = escapeForRegExp(request.name);
  const declarationSite = new RegExp(`^${fromType} ${name}${NAME_CHARACTER_LOOKAHEAD}`, 'gm');
  const referenceSite = new RegExp(`@${fromType}\\.${name}${NAME_CHARACTER_LOOKAHEAD}`, 'g');
  return source
    .replace(declarationSite, `${request.toType} ${request.name}`)
    .replace(referenceSite, `@${request.toType}.${request.name}`);
}

async function retypeCorpusFiles(request: RetypeRequest): Promise<number> {
  const rewritten: string[] = [];
  for await (const filePath of new Glob(CORPUS_FILES_PATTERN).scan({cwd: process.cwd()})) {
    const source = await Bun.file(filePath).text();
    const retyped = retypeEntity(source, request);
    if (retyped !== source) {
      await Bun.write(filePath, retyped);
      rewritten.push(filePath);
    }
  }
  if (rewritten.length === 0) {
    console.error(`no site of ${request.fromType} ${request.name} found under ${CORPUS_FILES_PATTERN}`);
    return 1;
  }
  console.log(rewritten.join('\n'));
  console.log(`${request.name}: ${request.fromType} to ${request.toType} in ${rewritten.length} file(s); validate with awawa lint --strict . and awawa status .`);
  return 0;
}

if (import.meta.main) {
  const [fromType, toType, name] = process.argv.slice(2);
  if (!fromType || !toType || !name) {
    console.error(USAGE);
    process.exit(2);
  }
  process.exit(await retypeCorpusFiles({fromType, toType, name}));
}
