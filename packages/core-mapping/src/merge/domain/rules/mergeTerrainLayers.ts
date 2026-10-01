import {TerrainLayerEntry} from '../../../save/domain/save/TerrainLayerEntry';
import {SaveSections} from '../../../save/domain/save/SaveSections';

export function mergeTerrainLayers(mainSave: SaveSections, secondarySave: SaveSections, writtenFormatSave: SaveSections): readonly TerrainLayerEntry[] | undefined {
  if (writtenFormatSave.terrainLayers === undefined) {
    return undefined;
  }

  return mainSave.terrainLayers ?? secondarySave.terrainLayers;
}
