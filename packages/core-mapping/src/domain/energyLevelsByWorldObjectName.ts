import {CURRENT_FORMAT_RELEASE, compareGameReleases, resolveGameRelease} from 'shared-save-processing/gameReleases.js';
import {WorldObjectName} from './worldObjectNames';
import energyLevels from './energyLevels.json' with {type: 'json'};

type EnergyLevelsByWorldObjectName = Partial<Record<WorldObjectName, number>>;

type EnergyRole = 'production' | 'consumption';

interface EnergyLevelRow {
  readonly worldObjectName: string;
  readonly role: string;
  readonly kilowatts: number;
  readonly fromRelease?: string;
}

export interface EnergyLevelsOfRelease {
  readonly release: string;
  readonly production: EnergyLevelsByWorldObjectName;
  readonly consumption: EnergyLevelsByWorldObjectName;
}

const energyLevelRows: readonly EnergyLevelRow[] = energyLevels;

function holdsInRelease(row: EnergyLevelRow, release: string): boolean {
  return row.fromRelease === undefined || compareGameReleases(row.fromRelease, release) <= 0;
}

function compareFromReleases(rowA: EnergyLevelRow, rowB: EnergyLevelRow): number {
  if (rowA.fromRelease === undefined || rowB.fromRelease === undefined) {
    return Number(rowA.fromRelease !== undefined) - Number(rowB.fromRelease !== undefined);
  }

  return compareGameReleases(rowA.fromRelease, rowB.fromRelease);
}

function selectEnergyLevelsByRole(role: EnergyRole, release: string): EnergyLevelsByWorldObjectName {
  return Object.fromEntries(
    energyLevelRows
      .filter((row) => row.role === role && holdsInRelease(row, release))
      .sort(compareFromReleases)
      .map((row) => [row.worldObjectName, row.kilowatts])
  );
}

export function selectEnergyLevelsOfDeclaredVersion(declaredVersion: string | undefined): EnergyLevelsOfRelease {
  const release = (declaredVersion === undefined ? undefined : resolveGameRelease(declaredVersion)) ?? CURRENT_FORMAT_RELEASE;

  return {
    release,
    production: selectEnergyLevelsByRole('production', release),
    consumption: selectEnergyLevelsByRole('consumption', release)
  };
}

export const energyProductionLevelsByWorldObjectName = selectEnergyLevelsByRole('production', CURRENT_FORMAT_RELEASE);
