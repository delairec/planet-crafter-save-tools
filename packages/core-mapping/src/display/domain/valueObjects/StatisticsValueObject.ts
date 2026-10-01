
export interface StatisticsValueObject {
  readonly totalCraftedObjects: number;
}

export function createStatisticsValueObject(input: StatisticsValueObject): StatisticsValueObject {
  return {
    totalCraftedObjects: input.totalCraftedObjects
  };
}
