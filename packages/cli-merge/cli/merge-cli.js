import {getCliArguments} from 'shared-platforms/platform.common.js';
import {extractPlatformParameter} from 'shared-platforms/extractPlatformParameter.js';
import {createPlatform} from 'shared-platforms/platform.js';
import cliManifest from '../package.json' with {type: 'json'};
import {initMergeCli, UNEXPECTED_ERROR_EXIT_CODE} from './initMergeCli.js';
import {renderUnexpectedError} from './renderMergeCliOutput.js';

const cliArguments = getCliArguments();
const platform = createPlatform(extractPlatformParameter(cliArguments));
const {main} = initMergeCli(platform, cliArguments, cliManifest);

if (platform.isEntryPoint(import.meta)) {
  main().catch(error => {
    renderUnexpectedError(error);
    platform.exitProcess(UNEXPECTED_ERROR_EXIT_CODE);
  });
}
