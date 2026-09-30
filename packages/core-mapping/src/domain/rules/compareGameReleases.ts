function splitVersionSegments(version: string): number[] {
  return version.split('.').map(Number);
}

export function compareGameReleases(releaseA: string, releaseB: string): number {
  const segmentsA = splitVersionSegments(releaseA);
  const segmentsB = splitVersionSegments(releaseB);
  const segmentsCount = Math.max(segmentsA.length, segmentsB.length);

  for (let segmentIndex = 0; segmentIndex < segmentsCount; segmentIndex++) {
    const difference = (segmentsA[segmentIndex] ?? 0) - (segmentsB[segmentIndex] ?? 0);

    if (difference !== 0) {
      return difference;
    }
  }

  return 0;
}
