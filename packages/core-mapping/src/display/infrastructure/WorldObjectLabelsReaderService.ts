import {selectWorldObjectLabelRows} from "data-world-objects/selectWorldObjectLabelRows";
import {WorldObjectLabelsReaderPort} from "../application/ports/WorldObjectLabelsReaderPort";

export class WorldObjectLabelsReaderService implements WorldObjectLabelsReaderPort {
  readWorldObjectLabels(): Readonly<Record<string, string>> {
    return Object.fromEntries(
      selectWorldObjectLabelRows().map((row) => [row.worldObjectName, row.label])
    );
  }
}
