// Node-safe on purpose: the Playwright global setup imports a script through it under Node, where the Bun API of
// scriptIo.ts is not defined.

/**
 * Runs the main function of a script when the module is the entry of the process, and never when a test imports it.
 * @param isEntryPoint import.meta.main of the script
 * @param main the main function of the script
 * @param io the input and output of the process, the only thing the main function receives
 */
export async function runAsEntryPointWith<Io>(isEntryPoint: boolean, main: (io: Io) => Promise<void>, io: Io): Promise<void> {
  if (isEntryPoint) {
    await main(io);
  }
}
