import {MergeSucceededResponse} from "../responses/MergeSucceededResponse";
import {SaveFilesInvalidResponse} from "../responses/SaveFilesInvalidResponse";
import {SaveFilesWithoutJsonExtensionResponse} from "../responses/SaveFilesWithoutJsonExtensionResponse";
import {SaveFilesWithoutUniqueHostResponse} from "../responses/SaveFilesWithoutUniqueHostResponse";

export interface MergeResultPresenterPort {
  presentMergeSucceeded(response: MergeSucceededResponse): void;

  presentSaveFilesWithoutJsonExtension(response: SaveFilesWithoutJsonExtensionResponse): void;

  presentSaveFilesInvalid(response: SaveFilesInvalidResponse): void;

  presentSaveFilesWithoutUniqueHost(response: SaveFilesWithoutUniqueHostResponse): void;

  presentMergedSaveUnusable(): void;
}
