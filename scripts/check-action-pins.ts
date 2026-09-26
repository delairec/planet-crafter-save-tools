import {runAsEntryPoint, type ScriptIo} from './scriptIo.ts';
import {reportViolations} from './specSources.ts';

const WORKFLOW_FILES_PATTERN = '.github/workflows/*.{yml,yaml}';
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
 * @param {ScriptIo} io the file system the workflows are read from
 * @returns the path and the content of every workflow file of the repository
 */
async function readWorkflowFiles(io: ScriptIo): Promise<WorkflowFile[]> {
  const filePaths: string[] = [];
  for await (const filePath of io.scanFiles(WORKFLOW_FILES_PATTERN)) {
    filePaths.push(filePath);
  }
  return Promise.all(filePaths.sort().map(async filePath => ({filePath, source: await io.readText(filePath)})));
}

/**
 * @param {ScriptIo} io the input and output of the guard
 */
export async function checkActionPins(io: ScriptIo): Promise<void> {
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations: findUnpinnedActions(await readWorkflowFiles(io)),
    nothingFound: 'every action the workflows use is pinned on a commit SHA with its version.',
    summarize: count => `${count} action reference(s) not pinned on a commit SHA with its version.`
  });
}

await runAsEntryPoint(import.meta.main, checkActionPins);
