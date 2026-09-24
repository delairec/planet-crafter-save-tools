import {readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {reportViolations} from './specSources.ts';

const WORKFLOWS_DIRECTORY = '.github/workflows';
const WORKFLOW_FILE = /\.ya?ml$/;
const USES_LINE = /^\s*(?:-\s+)?uses:\s*(['"]?)([^\s'"#]+)\1\s*(?:#\s*(\S.*))?$/;
const LOCAL_ACTION = './';
const PINNED_ON_COMMIT_SHA = /@[0-9a-f]{40}$/;
const CHECK_NAME = 'check:action-pins';

export interface WorkflowFile {
  filePath: string;
  source: string;
}

/**
 * @param {string} reference what a `uses:` names
 * @param {string | undefined} versionComment the comment that follows it, if any
 * @returns why the reference is not pinned, or undefined when it is
 */
function explainMissingPin(reference: string, versionComment: string | undefined): string | undefined {
  if (reference.startsWith(LOCAL_ACTION)) {
    return undefined;
  }
  if (!PINNED_ON_COMMIT_SHA.test(reference)) {
    return `uses ${reference}, which names no commit SHA`;
  }
  if (versionComment === undefined) {
    return `uses ${reference} with no comment giving the version it resolves to`;
  }
  return undefined;
}

/**
 * @param {WorkflowFile[]} workflows the path and the content of every workflow file
 * @returns one line per `uses:` that names no commit SHA or carries no version comment
 */
export function findUnpinnedActions(workflows: WorkflowFile[]): string[] {
  const violations: string[] = [];
  for (const {filePath, source} of workflows) {
    source.split('\n').forEach((line, index) => {
      const usesLine = USES_LINE.exec(line);
      if (usesLine === null) {
        return;
      }
      const missingPin = explainMissingPin(usesLine[2], usesLine[3]);
      if (missingPin !== undefined) {
        violations.push(`${filePath}:${index + 1} ${missingPin}`);
      }
    });
  }
  return violations;
}

/**
 * @returns the path and the content of every workflow file of the repository
 */
async function readWorkflowFiles(): Promise<WorkflowFile[]> {
  const fileNames = (await readdir(WORKFLOWS_DIRECTORY)).filter(fileName => WORKFLOW_FILE.test(fileName)).sort();
  return Promise.all(fileNames.map(async fileName => {
    const filePath = join(WORKFLOWS_DIRECTORY, fileName);
    return {filePath, source: await Bun.file(filePath).text()};
  }));
}

/**
 * @returns the exit code of the guard, once its report is printed
 */
async function checkActionPins(): Promise<number> {
  return reportViolations({
    checkName: CHECK_NAME,
    violations: findUnpinnedActions(await readWorkflowFiles()),
    nothingFound: 'every action the workflows use is pinned on a commit SHA with its version.',
    summarize: count => `${count} action reference(s) not pinned on a commit SHA with its version.`
  });
}

if (import.meta.main) {
  process.exit(await checkActionPins());
}
