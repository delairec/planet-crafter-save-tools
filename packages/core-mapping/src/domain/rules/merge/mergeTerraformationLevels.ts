import {TerraformationLevelEntry} from '../../save/TerraformationLevelEntry';

const PURIFICATION_SENTINEL = -1;

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

function mergePurificationLevel(levelA: number, levelB: number): number {
  if (levelA === PURIFICATION_SENTINEL && levelB === PURIFICATION_SENTINEL) {
    return PURIFICATION_SENTINEL;
  }
  if (levelA === PURIFICATION_SENTINEL) {
    return levelB;
  }
  if (levelB === PURIFICATION_SENTINEL) {
    return levelA;
  }

  return Math.max(levelA, levelB);
}
