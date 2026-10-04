import {PAGE_PATHS} from '~/lib/pagePaths';

export function resolvePlanetPagePath(planetIdentifier: string): string {
  return `${PAGE_PATHS.planetPath}?id=${encodeURIComponent(planetIdentifier)}`;
}
