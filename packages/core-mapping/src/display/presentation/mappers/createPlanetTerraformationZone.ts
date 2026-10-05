import {PlanetTerraformationResponse} from "../../application/responses/TerraformationPageResponse";
import {TerraformationLevelSummaryResponse} from "../../application/responses/TerraformationLevelSummaryResponse";
import {SystemTerraformationIndexResponse} from "../../application/responses/SystemTerraformationIndexResponse";
import {
  PlanetTerraformationZoneViewModel,
  TerraformationHeroFigureViewModel,
  TerraformationLevelRowViewModel,
  TerraformationLevelsTableViewModel
} from "../viewModels/PlanetTerraformationZoneViewModel";
import {formatTerraformationFigures, FormattedTerraformationFigures} from "./formatTerraformationFigures";
import {formatSystemTerraformationIndex} from "./formatSystemTerraformationIndex";
import {formatNumber} from "./formatters/formatNumber/formatNumber";
import {FormatNumberStrategies} from "./formatters/formatNumber/FormatNumberStrategies";
import {
  terraformationLevelsSectionAnimalsLabel,
  terraformationLevelsSectionBiomassLabel,
  terraformationLevelsSectionHeatLabel,
  terraformationLevelsSectionInsectsLabel,
  terraformationLevelsSectionOxygenLabel,
  terraformationLevelsSectionPlantsLabel,
  terraformationLevelsSectionPressureLabel,
  terraformationLevelsSectionPurificationLabel,
  terraformationLevelsSectionTerraformationIndexLabel,
  resolveTerraformationLevelsSectionMultipliedPlanets
} from "../messages/terraformationLevelsSectionMessages.js";
import {
  resolveTerraformationPageBiomassShares,
  resolveTerraformationPageFactorOfTheSystemTerraformationIndex,
  terraformationPageCaptionSeparator,
  terraformationPageNoLevelValue
} from "../messages/terraformationPageMessages.js";

const NO_LEVEL = 0;
const EMPTY_BAR_PERCENTAGE = 0;
const FULL_BAR_PERCENTAGE = 100;

interface TerraformationLevelFigure {
  readonly label: string;
  readonly level: number;
  readonly value: string;
}

export function createPlanetTerraformationZone({levels, systemTerraformationIndex}: PlanetTerraformationResponse): PlanetTerraformationZoneViewModel {
  const figures = formatTerraformationFigures(levels);
  return {
    planetName: levels.planetId,
    terraformationIndex: {value: figures.terraformationIndex, caption: captionTerraformationIndex(systemTerraformationIndex)},
    biomass: createBiomass(levels, figures),
    environmentalLevels: createLevelsTable(terraformationLevelsSectionTerraformationIndexLabel, figures.terraformationIndex, [
      {label: terraformationLevelsSectionOxygenLabel, level: levels.unitOxygenLevel, value: figures.oxygen},
      {label: terraformationLevelsSectionHeatLabel, level: levels.unitHeatLevel, value: figures.heat},
      {label: terraformationLevelsSectionPressureLabel, level: levels.unitPressureLevel, value: figures.pressure},
      ...listPurificationLevel(levels.unitPurificationLevel, figures.purification)
    ]),
    organicLevels: createLevelsTable(terraformationLevelsSectionBiomassLabel, figures.biomass, [
      {label: terraformationLevelsSectionPlantsLabel, level: levels.unitPlantsLevel, value: figures.plants},
      {label: terraformationLevelsSectionInsectsLabel, level: levels.unitInsectsLevel, value: figures.insects},
      {label: terraformationLevelsSectionAnimalsLabel, level: levels.unitAnimalsLevel, value: figures.animals}
    ])
  };
}

function captionTerraformationIndex(systemTerraformationIndex: SystemTerraformationIndexResponse | undefined): string {
  if (!systemTerraformationIndex) {
    return terraformationLevelsSectionTerraformationIndexLabel;
  }
  const factorOfTheSystemTerraformationIndex = resolveTerraformationPageFactorOfTheSystemTerraformationIndex(
    formatSystemTerraformationIndex(systemTerraformationIndex.index),
    resolveTerraformationLevelsSectionMultipliedPlanets(systemTerraformationIndex.planetCount)
  );
  return [terraformationLevelsSectionTerraformationIndexLabel, factorOfTheSystemTerraformationIndex].join(terraformationPageCaptionSeparator);
}

function createBiomass(levels: TerraformationLevelSummaryResponse, figures: FormattedTerraformationFigures): TerraformationHeroFigureViewModel {
  if (levels.biomass === NO_LEVEL) {
    return {value: figures.biomass, caption: terraformationLevelsSectionBiomassLabel};
  }
  const biomassShares = resolveTerraformationPageBiomassShares(
    formatNumber(levels.unitPlantsLevel / levels.biomass, FormatNumberStrategies.PERCENTAGE),
    formatNumber(levels.unitInsectsLevel / levels.biomass, FormatNumberStrategies.PERCENTAGE)
  );
  return {value: figures.biomass, caption: [terraformationLevelsSectionBiomassLabel, biomassShares].join(terraformationPageCaptionSeparator)};
}

function listPurificationLevel(unitPurificationLevel: number | undefined, purification: string | undefined): TerraformationLevelFigure[] {
  if (unitPurificationLevel === undefined || purification === undefined) {
    return [];
  }
  return [{label: terraformationLevelsSectionPurificationLabel, level: unitPurificationLevel, value: purification}];
}

function createLevelsTable(title: string, figure: string, levelFigures: readonly TerraformationLevelFigure[]): TerraformationLevelsTableViewModel {
  const largestLevel = Math.max(NO_LEVEL, ...levelFigures.map(({level}) => level));
  return {title, figure, rows: levelFigures.map((levelFigure) => createLevelRow(levelFigure, largestLevel))};
}

function createLevelRow({label, level, value}: TerraformationLevelFigure, largestLevel: number): TerraformationLevelRowViewModel {
  return {
    label,
    value: level === NO_LEVEL ? terraformationPageNoLevelValue : value,
    barWidthPercentage: scaleBar(level, largestLevel)
  };
}

function scaleBar(level: number, largestLevel: number): number {
  if (largestLevel === NO_LEVEL) {
    return EMPTY_BAR_PERCENTAGE;
  }
  return level / largestLevel * FULL_BAR_PERCENTAGE;
}
