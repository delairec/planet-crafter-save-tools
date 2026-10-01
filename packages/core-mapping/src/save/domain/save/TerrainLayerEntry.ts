export interface TerrainLayerEntry {
  readonly layerId: string;
  readonly planet: number;
  readonly colorBase: string;
  readonly colorCustom: string;
  readonly colorBaseLerp: number;
  readonly colorCustomLerp: number;
}
