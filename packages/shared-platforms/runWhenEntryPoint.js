/** @typedef {import('util-types/platform').RuntimePlatform} RuntimePlatform */

/**
 * @typedef {object} EntryPointRun
 * @property {{main?: boolean, url?: string}} importMeta
 * @property {() => Promise<void>} main
 * @property {(error: unknown) => void} renderUnexpectedError
 * @property {number} unexpectedErrorExitCode
 */

/**
 * @param {{isEntryPoint: RuntimePlatform['isEntryPoint'], exitProcess: (code: number) => void}} platform
 * @param {EntryPointRun} entryPointRun
 * @returns {Promise<void>}
 */
export async function runWhenEntryPoint({isEntryPoint, exitProcess}, {importMeta, main, renderUnexpectedError, unexpectedErrorExitCode}) {
  if (!isEntryPoint(importMeta)) {
    return;
  }

  try {
    await main();
  } catch (error) {
    renderUnexpectedError(error);
    exitProcess(unexpectedErrorExitCode);
  }
}
