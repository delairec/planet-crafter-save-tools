import type {SaveWarning as SaveFormatWarning} from "./wireFormat/gameDefinitions";
import {SAVE_WARNING_CODES} from "./wireFormat/saveWarningCodes.js";
import type {SaveWarning} from "../domain/validation/SaveWarning";

export function mapSaveWarning(warning: SaveFormatWarning): SaveWarning {
  switch (warning.code) {
    case SAVE_WARNING_CODES.LEGACY_SAVE_FORMAT:
      return {code: 'legacy-save-format'};
    case SAVE_WARNING_CODES.DECLARED_RELEASE_CONTRADICTS_CONTENT:
      return {
        code: 'declared-release-contradicts-content',
        declaredVersion: warning.declaredVersion,
        declaredRelease: warning.declaredRelease,
        carriedRelease: warning.carriedRelease
      };
  }
}
