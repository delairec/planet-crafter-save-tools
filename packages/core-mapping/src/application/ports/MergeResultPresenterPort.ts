import {MergeSucceededResponse} from "../responses/MergeSucceededResponse";
import {SaveFilesInvalidResponse} from "../responses/SaveFilesInvalidResponse";

export interface MergeResultPresenterPort {
  presentMergeSucceeded(response: MergeSucceededResponse): void;

  presentSaveFilesInvalid(response: SaveFilesInvalidResponse): void;

  presentMergedSaveUnusable(): void;
}
