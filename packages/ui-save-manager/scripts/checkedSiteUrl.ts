const productionHost = 'planet-crafter-save-manager.netlify.app';

export const productionSiteUrl = `https://${productionHost}/`;

const deployPreviewHostPattern = /^deploy-preview-(\d+)--planet-crafter-save-manager\.netlify\.app$/;

function parseRequestedUrl(requestedUrl: string): URL | undefined {
  try {
    return new URL(requestedUrl);
  } catch {
    return undefined;
  }
}

function isSiteRootOverHttps(url: URL): boolean {
  return url.protocol === 'https:'
    && url.username === ''
    && url.password === ''
    && url.port === ''
    && url.pathname === '/'
    && url.search === ''
    && url.hash === '';
}

export function resolveCheckedSiteUrl(requestedUrl: string): string | undefined {
  const url = parseRequestedUrl(requestedUrl);
  if (url === undefined || !isSiteRootOverHttps(url)) {
    return undefined;
  }
  if (url.hostname === productionHost) {
    return productionSiteUrl;
  }

  const deployPreviewNumber = deployPreviewHostPattern.exec(url.hostname)?.[1];
  if (deployPreviewNumber === undefined) {
    return undefined;
  }

  return `https://deploy-preview-${encodeURIComponent(deployPreviewNumber)}--${productionHost}/`;
}
