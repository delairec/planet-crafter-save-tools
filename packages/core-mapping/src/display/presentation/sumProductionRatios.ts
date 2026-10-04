export function sumProductionRatios(productionRatios: readonly (number | undefined)[]): number | undefined {
  return productionRatios.reduce<number | undefined>((total, ratio) => ratio === undefined ? total : (total ?? 0) + ratio, undefined);
}
