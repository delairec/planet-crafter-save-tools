export interface TerraformationHeroFigureViewModel {
  value: string;
  caption: string;
}

export interface TerraformationLevelRowViewModel {
  label: string;
  value: string;
  barWidthPercentage: number;
}

export interface TerraformationLevelsTableViewModel {
  title: string;
  figure: string;
  rows: TerraformationLevelRowViewModel[];
}

export interface PlanetTerraformationZoneViewModel {
  planetName: string;
  terraformationIndex: TerraformationHeroFigureViewModel;
  biomass: TerraformationHeroFigureViewModel;
  environmentalLevels: TerraformationLevelsTableViewModel;
  organicLevels: TerraformationLevelsTableViewModel;
}
