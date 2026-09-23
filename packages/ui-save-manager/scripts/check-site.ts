import {readSiteHeaders} from '../siteHeaders';
import {removeScriptNonces} from '../src/lib/scriptNonce';

const checkedHeaderNames = ['Content-Security-Policy', 'Referrer-Policy', 'Permissions-Policy'];

const productionSiteUrl = 'https://planet-crafter-save-manager.netlify.app/';

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

const siteUrl = process.argv.find((argument) => argument.startsWith(urlFlag))?.slice(urlFlag.length) ?? productionSiteUrl;

const defects = await findSiteDefects(siteUrl);

if (defects.length > 0) {
  console.error(defects.join('\n'));
  process.exit(1);
}
console.log(`${siteUrl} loads and carries ${checkedHeaderNames.join(', ')} as public/_headers declares them.`);
