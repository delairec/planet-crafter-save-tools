/**
 * A save the tool could read, but not as the current format writes it, or not as the game release
 * it declares writes it. A warning never stops the processing: the save is read by what it carries
 * and the consumer is told what did not match.
 *
 * `SAVE_WARNING_CODES` in `saveWarningCodes.js` holds the codes; this union is what a consumer types
 * against, so no consumer of the type has to import a runtime module.
 */
export type SaveWarning =
  | {code: 'legacy-save-format'}
  | {code: 'declared-release-contradicts-content'; declaredVersion: string; declaredRelease: string; carriedRelease: string};

export type SaveWarningCode = SaveWarning['code'];
