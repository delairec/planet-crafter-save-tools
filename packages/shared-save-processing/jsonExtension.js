const JSON_EXTENSION_PATTERN = /\.json$/i;

export function hasJsonExtension(fileName) {
  return JSON_EXTENSION_PATTERN.test(fileName);
}

export function stripJsonExtension(fileName) {
  return fileName.replace(JSON_EXTENSION_PATTERN, '');
}
