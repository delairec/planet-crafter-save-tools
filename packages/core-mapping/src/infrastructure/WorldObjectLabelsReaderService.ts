import {selectWorldObjectLabelRows} from "data-world-objects/selectWorldObjectLabelRows";
import {WorldObjectLabels, WorldObjectLabelsReaderPort} from "../application/ports/WorldObjectLabelsReaderPort";

export class WorldObjectLabelsReaderService implements WorldObjectLabelsReaderPort {
  readWorldObjectLabels(): WorldObjectLabels {
    return Object.fromEntries(
      selectWorldObjectLabelRows().map((row) => [row.worldObjectName, row.label])
    );
  }
}
