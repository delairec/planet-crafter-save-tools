import {CurrentFormatSections, ParsedSections} from "shared-save-processing/gameDefinitions";
import {LEGACY_SPLIT_PARTS_COUNT, LEGACY_TERRAIN_LAYERS_SECTION_INDEX} from "shared-save-processing/sectionIndexes.js";

/**
 * The sections of a parsed save at the indexes of the format of 2.004, the only one core-mapping
 * reads so far: a save of 1.618 is given without its Terrain Layers section. The parser keeps every
 * part the file carries; this selection is where core-mapping still leaves one out, until it reaches
 * each section by the index the format of its save gives it.
 */
export function selectCurrentFormatSections(sections: ParsedSections): CurrentFormatSections {
  if (sections.length !== LEGACY_SPLIT_PARTS_COUNT) {
    return sections as CurrentFormatSections;
  }

  return sections.toSpliced(LEGACY_TERRAIN_LAYERS_SECTION_INDEX, 1) as CurrentFormatSections;
}
