import {compareGameReleases} from '../../save/domain/rules/compareGameReleases';
import {resolveGameReleaseOfDeclaredVersion} from './rules/resolveGameReleaseOfDeclaredVersion';
import {WorldObjectName} from './worldObjectNames';
import {EnergyLevelValueObject} from './valueObjects/EnergyLevelValueObject';
import {GameReleaseValueObject} from '../../save/domain/valueObjects/GameReleaseValueObject';

export type EnergyLevelsByWorldObjectName = Partial<Record<WorldObjectName, number>>;

type EnergyRole = 'production' | 'consumption';

export type DivergingEnergyLevelsByRelease = Readonly<Partial<Record<string, readonly EnergyLevelValueObject[]>>>;

export interface EnergyLevelTables {
  readonly energyLevels: readonly EnergyLevelValueObject[];
  readonly divergingEnergyLevelsByRelease: DivergingEnergyLevelsByRelease;
}

export interface EnergyLevelsOfRelease {
  readonly release: string;
  readonly production: EnergyLevelsByWorldObjectName;
  readonly consumption: EnergyLevelsByWorldObjectName;
}

function selectRowsOfRelease(release: string, {energyLevels, divergingEnergyLevelsByRelease}: EnergyLevelTables): readonly EnergyLevelValueObject[] {
  const cascadingRows = Object.entries(divergingEnergyLevelsByRelease)
    .filter(([tableRelease]) => compareGameReleases(tableRelease, release) >= 0)
    .sort(([releaseA], [releaseB]) => compareGameReleases(releaseB, releaseA))
    .flatMap(([, rows]) => rows ?? []);

  return [...energyLevels, ...cascadingRows];
}

function selectEnergyLevelsByRole(role: EnergyRole, rows: readonly EnergyLevelValueObject[]): EnergyLevelsByWorldObjectName {
  return Object.fromEntries(
    rows.filter((row) => row.role === role).map((row) => [row.worldObjectName, row.kilowatts])
  );
}

export function selectEnergyLevelsOfDeclaredVersion(declaredVersion: string | undefined, tables: EnergyLevelTables, gameReleases: readonly GameReleaseValueObject[]): EnergyLevelsOfRelease {
  const release = resolveGameReleaseOfDeclaredVersion(declaredVersion, gameReleases);
  const rows = selectRowsOfRelease(release, tables);

  return {
    release,
    production: selectEnergyLevelsByRole('production', rows),
    consumption: selectEnergyLevelsByRole('consumption', rows)
  };
}
