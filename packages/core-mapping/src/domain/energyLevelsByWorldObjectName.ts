import {CURRENT_FORMAT_RELEASE, compareGameReleases, resolveGameRelease} from 'shared-save-processing/gameReleases.js';
import {WorldObjectName} from './worldObjectNames';
import energyLevels from './energyLevels.json' with {type: 'json'};
import energyLevelsOf2004 from './energyLevelsByRelease/2.004.json' with {type: 'json'};

type EnergyLevelsByWorldObjectName = Partial<Record<WorldObjectName, number>>;

type EnergyRole = 'production' | 'consumption';

interface EnergyLevelRow {
  readonly worldObjectName: string;
  readonly role: string;
  readonly kilowatts: number;
}

export interface EnergyLevelsOfRelease {
  readonly release: string;
  readonly production: EnergyLevelsByWorldObjectName;
  readonly consumption: EnergyLevelsByWorldObjectName;
}

/** The rows of an earlier release whose value differs from the next newer table; each table also applies to every release before its own. */
export const divergingEnergyLevelsByRelease: Readonly<Partial<Record<string, readonly EnergyLevelRow[]>>> = {
  '2.004': energyLevelsOf2004
};

function selectRowsOfRelease(release: string): readonly EnergyLevelRow[] {
  const cascadingRows = Object.entries(divergingEnergyLevelsByRelease)
    .filter(([tableRelease]) => compareGameReleases(tableRelease, release) >= 0)
    .sort(([releaseA], [releaseB]) => compareGameReleases(releaseB, releaseA))
    .flatMap(([, rows]) => rows ?? []);

  return [...energyLevels, ...cascadingRows];
}

function selectEnergyLevelsByRole(role: EnergyRole, rows: readonly EnergyLevelRow[]): EnergyLevelsByWorldObjectName {
  return Object.fromEntries(
    rows.filter((row) => row.role === role).map((row) => [row.worldObjectName, row.kilowatts])
  );
}

export function selectEnergyLevelsOfDeclaredVersion(declaredVersion: string | undefined): EnergyLevelsOfRelease {
  const release = (declaredVersion === undefined ? undefined : resolveGameRelease(declaredVersion)) ?? CURRENT_FORMAT_RELEASE;
  const rows = selectRowsOfRelease(release);

  return {
    release,
    production: selectEnergyLevelsByRole('production', rows),
    consumption: selectEnergyLevelsByRole('consumption', rows)
  };
}

export const energyProductionLevelsByWorldObjectName = selectEnergyLevelsByRole('production', energyLevels);
