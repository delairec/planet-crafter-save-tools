export type SaveWarningResponse =
  | {code: 'legacy-save-format'}
  | {code: 'declared-release-contradicts-content'; declaredVersion: string; declaredRelease: string; carriedRelease: string};
