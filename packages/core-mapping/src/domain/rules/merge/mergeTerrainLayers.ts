import {TerrainLayer} from 'shared-save-processing/gameDefinitions';
import {SaveSections} from '../../save/SaveSections';

export function mergeTerrainLayers(mainSave: SaveSections, secondarySave: SaveSections, writtenFormatSave: SaveSections): TerrainLayer[] | undefined {
  if (writtenFormatSave.terrainLayers === undefined) {
    return undefined;
  }

  return mainSave.terrainLayers ?? secondarySave.terrainLayers;
}
