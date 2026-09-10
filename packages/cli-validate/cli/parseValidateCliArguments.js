const FILE_FLAG = '--file=';

/**
 * @param {string[]} argv
 * @returns {{filePath: string | undefined}}
 */
export function parseValidateCliArguments(argv) {
  const fileArgument = argv.find(argument => argument.startsWith(FILE_FLAG));

  return {
    filePath: fileArgument && fileArgument.split('=')[1]
  };
}
