export interface PlayerEntry {
  readonly id: string;
  readonly name: string;
  readonly inventoryId: number;
  readonly equipmentId: number;
  readonly playerPosition: string;
  readonly playerRotation: string;
  readonly playerGaugeOxygen: number;
  readonly playerGaugeThirst: number;
  readonly playerGaugeHealth: number;
  readonly playerGaugeToxic: number;
  readonly host: boolean;
  readonly planetId?: string;
  readonly cameraView?: number;
  readonly totalCraftedObjects?: number;
  readonly totalTerraTokenEarned?: number;
}
