import {WorldObjectLabelsResponse} from "../responses/WorldObjectLabelsResponse";

export interface WorldObjectLabelsReaderPort {
  readWorldObjectLabels(): WorldObjectLabelsResponse;
}
