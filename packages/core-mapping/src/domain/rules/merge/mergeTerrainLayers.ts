import {TerrainLayerEntry} from '../../save/TerrainLayerEntry';
import {SaveSections} from '../../save/SaveSections';

export function mergeTerrainLayers(mainSave: SaveSections, secondarySave: SaveSections, writtenFormatSave: SaveSections): readonly TerrainLayerEntry[] | undefined {
  if (writtenFormatSave.terrainLayers === undefined) {
    return undefined;
  }

  return mainSave.terrainLayers ?? secondarySave.terrainLayers;
}
