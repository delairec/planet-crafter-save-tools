import type {UnreadableLinesResponse} from "../responses/UnreadableLinesResponse";
import {OverviewPageResponse} from "../responses/OverviewPageResponse";

export interface OverviewPagePresenterPort {
  displayOverviewPage(overviewPage: OverviewPageResponse): void;

  displaySaveWithUnreadableLines(response: UnreadableLinesResponse): void;
}
