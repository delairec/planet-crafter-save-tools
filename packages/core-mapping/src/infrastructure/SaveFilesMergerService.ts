import {mergeParsedSaveSections} from "../domain/rules/merge/mergeParsedSaveSections.ts";
import {resolveIdConflicts} from "../domain/rules/merge/resolveIdConflicts.ts";
import {buildMergedFileName} from "../domain/rules/merge/buildMergedFileName.ts";
import type {SaveFilesMergerPort} from "../application/ports/SaveFilesMergerPort.ts";
import {createMergedSaveValueObject, type MergedSaveValueObject} from "../domain/valueObjects/MergedSaveValueObject.ts";
import {parseSaveSections} from "shared-save-processing/parseSaveSections.js";

export class SaveFilesMergerService implements SaveFilesMergerPort {
  merge(fileNameA: string, contentA: string, fileNameB: string, contentB: string, saveDisplayName?: string): MergedSaveValueObject {
    const fileName = buildMergedFileName(fileNameA, fileNameB);
    const resolvedSaveDisplayName = saveDisplayName ?? fileName.replace(/\.json$/, '');

    const parsedSaveA = parseSaveSections(contentA);
    const parsedSaveB = parseSaveSections(contentB);

    const {mergeSaves, saveAWorldObjectIds} = mergeParsedSaveSections(parsedSaveA, parsedSaveB, resolvedSaveDisplayName);
    const mergedSections = mergeSaves();
    const content = resolveIdConflicts(mergedSections, saveAWorldObjectIds);

    return createMergedSaveValueObject({fileName, content});
  }
}
