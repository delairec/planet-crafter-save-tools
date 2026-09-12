/**
 * A save the tool could read, but not as the current format writes it. A warning never stops the
 * processing: the save is adapted and the consumer is told what was adapted.
 *
 * `SAVE_WARNING_CODES` in `normalizeRawSections.js` holds the values; this union is what a
 * consumer types against, so no consumer of the type has to import a runtime module.
 */
export type SaveWarningCode = 'legacy-save-format';
