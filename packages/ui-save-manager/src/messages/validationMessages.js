/** @param {string} action */
const validationMessagesDetailsLabel = (action) => `${action} details`;
export const showValidationMessagesDetails = validationMessagesDetailsLabel('Show');
export const hideValidationMessagesDetails = validationMessagesDetailsLabel('Hide');

/** Introduces the location of a validation message, the way a stack frame introduces its origin. */
export const validationMessageLocationPrefix = 'at';
