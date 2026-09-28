import {MergedSaveSections} from './MergedSaveSections';
import {MergeWarning} from './MergeWarning';

export interface SaveSectionsMerge {
  readonly sections: MergedSaveSections;
  readonly warnings: readonly MergeWarning[];
  readonly legacyFormatCouldBeKept: boolean;
}
