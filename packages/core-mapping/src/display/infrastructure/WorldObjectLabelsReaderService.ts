import {selectWorldObjectLabelRows} from "data-world-objects/selectWorldObjectLabelRows";
import {WorldObjectLabelsReaderPort} from "../application/ports/WorldObjectLabelsReaderPort";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";

export class WorldObjectLabelsReaderService implements WorldObjectLabelsReaderPort {
  readWorldObjectLabels(): WorldObjectLabelsResponse {
    return Object.fromEntries(
      selectWorldObjectLabelRows().map((row) => [row.worldObjectName, row.label])
    );
  }
}
