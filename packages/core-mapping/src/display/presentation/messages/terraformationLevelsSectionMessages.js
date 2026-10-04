export const terraformationLevelsSectionOxygenLabel = 'O²';
export const terraformationLevelsSectionHeatLabel = 'Heat';
export const terraformationLevelsSectionPressureLabel = 'Pressure';
export const terraformationLevelsSectionPurificationLabel = 'Purification';
export const terraformationLevelsSectionPlantsLabel = 'Plants';
export const terraformationLevelsSectionInsectsLabel = 'Insects';
export const terraformationLevelsSectionAnimalsLabel = 'Animals';
export const terraformationLevelsSectionBiomassLabel = 'Biomass';
export const terraformationLevelsSectionTerraformationIndexLabel = 'Terraformation Index';

export const terraformationLevelsSectionPurificationUnit = 'Pu';
export const terraformationLevelsSectionTerraformationIndexUnit = 'Ti';
export const terraformationLevelsSectionSystemTerraformationIndexUnit = 'SysTi';

/** @param {number} planetCount */
export const resolveTerraformationLevelsSectionMultipliedPlanets = (planetCount) => planetCount === 1 ? 'multiplied over 1 planet' : `multiplied over ${planetCount} planets`;
