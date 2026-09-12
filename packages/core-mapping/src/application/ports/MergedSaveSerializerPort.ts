import {MergedSaveSections} from "../../domain/rules/merge/MergedSaveSections";

export interface MergedSaveFile {
  readonly fileName: string;
  readonly content: string;
}

export interface SourceFileNames {
  readonly fileNameA: string;
  readonly fileNameB: string;
}

export interface MergedFileName {
  readonly fileName: string;
  readonly stem: string;
}

export interface MergedSaveToSerialize {
  readonly fileName: string;
  readonly sections: MergedSaveSections;
}

export interface MergedSaveSerializerPort {
  buildFileName(sourceFileNames: SourceFileNames): MergedFileName;

  serialize(mergedSave: MergedSaveToSerialize): MergedSaveFile;
}
