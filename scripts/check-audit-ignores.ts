import {Glob} from 'bun';
import {join} from 'node:path';
import {readCorpusLines, removeQuotes} from './check-corpus-anchors.ts';
import {isOwnSourceFile, reportViolations} from './specSources.ts';

const CORPUS_FILES_PATTERN = '**/*.awawa';
const IGNORED_ADVISORY = /--ignore=(\S+)/g;
const CHECK_NAME = 'check:audit-ignores';

export interface AuditIgnoresSources {
  auditScript: string;
  corpusSource: string;
}

/**
 * @param {string} auditScript the audit script of the root manifest
 * @returns every advisory id it ignores, in the order it lists them
 */
function extractIgnoredAdvisories(auditScript: string): string[] {
  const advisories: string[] = [];
  for (const match of auditScript.matchAll(IGNORED_ADVISORY)) {
    advisories.push(match[1]);
  }
  return advisories;
}

/**
 * @param {string} corpusSource the text of one or several corpus files
 * @returns the SEEN_IN value of every active LIMITATION entity, continuations joined
 */
function collectActiveLimitationSeenIns(corpusSource: string): string[] {
  const seenIns: string[] = [];
  let isLimitation = false;
  let isArchived = false;
  let entitySeenIns: string[] = [];
  const closeEntity = (): void => {
    if (isLimitation && !isArchived) {
      seenIns.push(...entitySeenIns);
    }
  };
  for (const {depth, keyword, pieces} of readCorpusLines(corpusSource)) {
    if (depth === 0) {
      closeEntity();
      isLimitation = keyword === 'LIMITATION';
      isArchived = false;
      entitySeenIns = [];
      continue;
    }
    if (keyword === 'SEEN_IN') {
      entitySeenIns.push(pieces.map(removeQuotes).join(' '));
    }
    if (keyword === 'STATUS' && removeQuotes(pieces[0]) === 'archived') {
      isArchived = true;
    }
  }
  closeEntity();
  return seenIns;
}

/**
 * @param {AuditIgnoresSources} sources the audit script of the root manifest and the text of the corpus files
 * @returns every advisory the audit ignores that no active LIMITATION names in a SEEN_IN
 */
export function findUnacknowledgedAdvisories({auditScript, corpusSource}: AuditIgnoresSources): string[] {
  const ignoredAdvisories = extractIgnoredAdvisories(auditScript);
  const activeSeenIns = collectActiveLimitationSeenIns(corpusSource);
  return ignoredAdvisories.filter(advisory => !activeSeenIns.some(seenIn => seenIn.includes(advisory)));
}

/**
 * @param {string} workspaceRoot the root the corpus and the manifest are read from
 * @returns every advisory the audit script ignores that no active LIMITATION names
 */
async function findRepositoryUnacknowledgedAdvisories(workspaceRoot: string): Promise<string[]> {
  const manifest = await Bun.file(join(workspaceRoot, 'package.json')).json();
  const auditScript = manifest.scripts.audit;
  const corpusSources: string[] = [];
  for await (const file of new Glob(CORPUS_FILES_PATTERN).scan({cwd: workspaceRoot})) {
    if (isOwnSourceFile(file)) {
      corpusSources.push(await Bun.file(join(workspaceRoot, file)).text());
    }
  }
  return findUnacknowledgedAdvisories({auditScript, corpusSource: corpusSources.join('\n')});
}

/**
 * @returns the exit code of the guard, once its report is printed
 */
async function checkAuditIgnores(): Promise<number> {
  const unacknowledgedAdvisories = await findRepositoryUnacknowledgedAdvisories(process.cwd());
  return reportViolations({
    checkName: CHECK_NAME,
    violations: unacknowledgedAdvisories.map(advisory =>
      `package.json scripts.audit ignores ${advisory}, which no active LIMITATION names in a SEEN_IN`),
    nothingFound: 'every advisory the audit ignores is named by an active LIMITATION.',
    summarize: count => `${count} ignored advisory(ies) no active LIMITATION names.`
  });
}

if (import.meta.main) {
  process.exit(await checkAuditIgnores());
}
