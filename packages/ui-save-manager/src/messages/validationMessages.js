/** @param {string} action */
const resolveValidationMessagesDetailsLabel = (action) => `${action} details`;
export const showValidationMessagesDetails = resolveValidationMessagesDetailsLabel('Show');
export const hideValidationMessagesDetails = resolveValidationMessagesDetailsLabel('Hide');

/** Introduces the location of a validation message, the way a stack frame introduces its origin. */
export const validationMessageLocationPrefix = 'at';
