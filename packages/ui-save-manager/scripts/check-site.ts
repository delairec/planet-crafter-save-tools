import {readSiteHeaders} from '../siteHeaders';
import {removeScriptNonces} from '../src/lib/scriptNonce';
import {productionSiteUrl, resolveCheckedSiteUrl} from './checkedSiteUrl.ts';

const checkedHeaderNames = ['Content-Security-Policy', 'Referrer-Policy', 'Permissions-Policy'];

const urlFlag = '--url=';

async function findSiteDefects(siteUrl: string): Promise<string[]> {
  const response = await fetch(siteUrl);
  if (!response.ok) {
    return [`${siteUrl} answers ${response.status}.`];
  }

  const siteHeaders = readSiteHeaders();

  return checkedHeaderNames.flatMap((headerName) => {
    const servedValue = response.headers.get(headerName);
    if (servedValue === null) {
      return [`${headerName} is missing.`];
    }

    return removeScriptNonces(servedValue) === siteHeaders[headerName]
      ? []
      : [`${headerName} is "${servedValue}", public/_headers declares "${siteHeaders[headerName]}".`];
  });
}

const requestedUrl = process.argv.find((argument) => argument.startsWith(urlFlag))?.slice(urlFlag.length) ?? productionSiteUrl;
const siteUrl = resolveCheckedSiteUrl(requestedUrl);

if (siteUrl === undefined) {
  console.error(`${requestedUrl} is refused: ${urlFlag} accepts ${productionSiteUrl} or one of its deploy previews, https://deploy-preview-<number>--planet-crafter-save-manager.netlify.app/.`);
  process.exit(1);
}

const defects = await findSiteDefects(siteUrl);

if (defects.length > 0) {
  console.error(defects.join('\n'));
  process.exit(1);
}
console.log(`${siteUrl} loads and carries ${checkedHeaderNames.join(', ')} as public/_headers declares them.`);
