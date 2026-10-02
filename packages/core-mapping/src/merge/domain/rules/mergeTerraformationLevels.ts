import {TerraformationLevelEntry} from '../../../save/domain/save/TerraformationLevelEntry';

export function mergeTerraformationLevels(terraformationLevelsA: readonly TerraformationLevelEntry[], terraformationLevelsB: readonly TerraformationLevelEntry[]): TerraformationLevelEntry[] {
  const planetIds = new Set([...terraformationLevelsA, ...terraformationLevelsB].map(level => level.planetId));

  return Array.from(planetIds).map(planetId => {
    const levelA = terraformationLevelsA.find(level => level.planetId === planetId);
    const levelB = terraformationLevelsB.find(level => level.planetId === planetId);

    if (levelA && levelB) {
      return {
        planetId,
        unitOxygenLevel: Math.max(levelA.unitOxygenLevel, levelB.unitOxygenLevel),
        unitHeatLevel: Math.max(levelA.unitHeatLevel, levelB.unitHeatLevel),
        unitPressureLevel: Math.max(levelA.unitPressureLevel, levelB.unitPressureLevel),
        unitPlantsLevel: Math.max(levelA.unitPlantsLevel, levelB.unitPlantsLevel),
        unitInsectsLevel: Math.max(levelA.unitInsectsLevel, levelB.unitInsectsLevel),
        unitAnimalsLevel: Math.max(levelA.unitAnimalsLevel, levelB.unitAnimalsLevel),
        unitPurificationLevel: mergePurificationLevel(levelA.unitPurificationLevel, levelB.unitPurificationLevel),
      };
    }

    return (levelA ?? levelB) as TerraformationLevelEntry;
  });
}

function mergePurificationLevel(levelA: number | undefined, levelB: number | undefined): number | undefined {
  if (levelA === undefined) {
    return levelB;
  }
  if (levelB === undefined) {
    return levelA;
  }

  return Math.max(levelA, levelB);
}
