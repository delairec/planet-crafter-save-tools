import {MergeSucceededResponse} from "../responses/MergeSucceededResponse";
import {SaveFilesInvalidResponse} from "../responses/SaveFilesInvalidResponse";
import {SaveFilesWithoutUniqueHostResponse} from "../responses/SaveFilesWithoutUniqueHostResponse";

export interface MergeResultPresenterPort {
  presentMergeSucceeded(response: MergeSucceededResponse): void;

  presentSaveFilesInvalid(response: SaveFilesInvalidResponse): void;

  presentSaveFilesWithoutUniqueHost(response: SaveFilesWithoutUniqueHostResponse): void;

  presentMergedSaveUnusable(): void;
}
