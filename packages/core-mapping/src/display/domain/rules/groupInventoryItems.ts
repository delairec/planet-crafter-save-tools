export interface InventoryItemGroup {
  readonly worldObjectName: string;
  readonly count: number;
}

export function groupInventoryItems(inventory: readonly string[]): InventoryItemGroup[] {
  const counts = new Map<string, number>();
  for (const worldObjectName of inventory) {
    counts.set(worldObjectName, (counts.get(worldObjectName) ?? 0) + 1);
  }
  return [...counts].map(([worldObjectName, count]) => ({worldObjectName, count}));
}
