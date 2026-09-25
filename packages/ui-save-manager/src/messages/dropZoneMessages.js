/** @param {string} fileName */
export const resolveNotJsonFileMessage = (fileName) => `${fileName} is not a JSON save file.`;

/** @param {string} acceptedFiles */
const resolveTooManyFilesMessage = (acceptedFiles) => `Drop ${acceptedFiles} here.`;
export const tooManyFilesForOneSaveMessage = resolveTooManyFilesMessage('a single save file');
export const tooManyFilesForTwoSavesMessage = resolveTooManyFilesMessage('two save files at most');
