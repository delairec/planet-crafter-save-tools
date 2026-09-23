import {readSiteHeaders} from '../siteHeaders';
import {removeScriptNonces} from '../src/lib/scriptNonce';

/** The headers every response of the site must carry, as `public/_headers` declares them. */
const checkedHeaderNames = ['Content-Security-Policy', 'Referrer-Policy', 'Permissions-Policy'];

const productionSiteUrl = 'https://planet-crafter-save-manager.netlify.app/';

const urlFlag = '--url=';
const attemptsFlag = '--attempts=';

/** Pause between two attempts, long enough for a deployment to progress. */
const attemptIntervalMilliseconds = 30_000;

function readFlag(flag: string): string | undefined {
  return process.argv.find((argument) => argument.startsWith(flag))?.slice(flag.length);
}

/** The defects of the site at `siteUrl`, one line each; none when it loads with every header. */
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

const siteUrl = readFlag(urlFlag) ?? productionSiteUrl;
const attempts = Number(readFlag(attemptsFlag) ?? '1');

let defects: string[] = [];
for (let attempt = 1; attempt <= attempts; attempt++) {
  defects = await findSiteDefects(siteUrl);
  if (defects.length === 0) {
    break;
  }
  if (attempt < attempts) {
    await Bun.sleep(attemptIntervalMilliseconds);
  }
}

if (defects.length > 0) {
  console.error(defects.join('\n'));
  process.exit(1);
}
console.log(`${siteUrl} loads and carries ${checkedHeaderNames.join(', ')} as public/_headers declares them.`);
