export interface PlanetNamesReaderPort {
  findPlanetNameOfNumericId(numericId: number): string | undefined;
}
