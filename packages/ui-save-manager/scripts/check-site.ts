import {readSiteHeaders} from '../siteHeaders';
import {removeScriptNonces} from '../src/lib/scriptNonce';

const checkedHeaderNames = ['Content-Security-Policy', 'Referrer-Policy', 'Permissions-Policy'];

const productionSiteUrl = 'https://planet-crafter-save-manager.netlify.app/';

const urlFlag = '--url=';
const attemptsFlag = '--attempts=';
const commitFlag = '--commit=';

const buildCommitHeaderName = 'X-Build-Commit';

const attemptIntervalMilliseconds = 30_000;

function readFlag(flag: string): string | undefined {
  return process.argv.find((argument) => argument.startsWith(flag))?.slice(flag.length);
}

async function findSiteDefects(siteUrl: string, expectedCommit: string | undefined): Promise<string[]> {
  const response = await fetch(siteUrl);
  if (!response.ok) {
    return [`${siteUrl} answers ${response.status}.`];
  }

  const servedCommit = response.headers.get(buildCommitHeaderName);
  if (expectedCommit !== undefined && servedCommit !== expectedCommit) {
    return [`${siteUrl} serves the build of commit ${servedCommit ?? 'unnamed'}, not of ${expectedCommit}.`];
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
const expectedCommit = readFlag(commitFlag);

let defects: string[] = [];
for (let attempt = 1; attempt <= attempts; attempt++) {
  defects = await findSiteDefects(siteUrl, expectedCommit);
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
