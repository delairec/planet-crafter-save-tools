import {CURRENT_FORMAT_RELEASE, resolveGameRelease} from 'shared-save-processing/gameReleases.js';
import {WorldObjectName} from './worldObjectNames';
import energyLevels from './energyLevels.json' with {type: 'json'};
import energyLevelsOf1618 from './energyLevelsByRelease/1.618.json' with {type: 'json'};
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

/** The rows of an earlier release whose value differs from the energy levels table, which holds the last release. */
export const divergingEnergyLevelsByRelease: Readonly<Partial<Record<string, readonly EnergyLevelRow[]>>> = {
  '1.618': energyLevelsOf1618,
  '2.004': energyLevelsOf2004
};

function selectEnergyLevelsByRole(role: EnergyRole, rows: readonly EnergyLevelRow[]): EnergyLevelsByWorldObjectName {
  return Object.fromEntries(
    rows.filter((row) => row.role === role).map((row) => [row.worldObjectName, row.kilowatts])
  );
}

export function selectEnergyLevelsOfDeclaredVersion(declaredVersion: string | undefined): EnergyLevelsOfRelease {
  const release = (declaredVersion === undefined ? undefined : resolveGameRelease(declaredVersion)) ?? CURRENT_FORMAT_RELEASE;
  const rows = [...energyLevels, ...(divergingEnergyLevelsByRelease[release] ?? [])];

  return {
    release,
    production: selectEnergyLevelsByRole('production', rows),
    consumption: selectEnergyLevelsByRole('consumption', rows)
  };
}

export const energyProductionLevelsByWorldObjectName = selectEnergyLevelsByRole('production', energyLevels);
