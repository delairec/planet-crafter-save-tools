import {readFileSync} from 'node:fs';

const headersFileUrl = new URL('./public/_headers', import.meta.url);

/** The path pattern of the `_headers` block that applies to every response of the site. */
const everyPathPattern = '/*';

/**
 * Reads the headers `public/_headers` declares for every path of the site. Netlify applies that
 * file to the static files alone; the server applies the same record to the responses it renders,
 * so the file stays the single source of both.
 */
export function readSiteHeaders(): Record<string, string> {
  const lines = readFileSync(headersFileUrl, 'utf8').split('\n');
  const blockStart = lines.findIndex((line) => line.trim() === everyPathPattern);
  if (blockStart === -1) {
    throw new Error(`public/_headers declares no "${everyPathPattern}" block.`);
  }

  const siteHeaders: Record<string, string> = {};
  for (const line of lines.slice(blockStart + 1)) {
    if (!/^\s/.test(line) || line.trim() === '') {
      break;
    }
    const separatorIndex = line.indexOf(':');
    siteHeaders[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim();
  }

  return siteHeaders;
}
