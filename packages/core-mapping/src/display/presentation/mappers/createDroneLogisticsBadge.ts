import {DroneLogisticsEffectResponse, DroneLogisticsResponse} from "../../application/responses/DroneLogisticsResponse";
import {TonedValueViewModel, ToneViewModel} from "../viewModels/ConfigurationPageViewModel";
import {
  configurationPageDroneLogisticsPausedValue,
  configurationPageDroneLogisticsRunningValue,
  configurationPageHelpingToneLabel,
  configurationPagePenalisingToneLabel
} from "../messages/configurationPageMessages.js";

const toneByDroneLogisticsEffect: Record<DroneLogisticsEffectResponse, ToneViewModel> = {
  penalisesThePlayer: 'danger',
  helpsThePlayer: 'positive'
};

const toneLabelByDroneLogisticsEffect: Record<DroneLogisticsEffectResponse, string> = {
  penalisesThePlayer: configurationPagePenalisingToneLabel,
  helpsThePlayer: configurationPageHelpingToneLabel
};

export function createDroneLogisticsBadge({paused, effect}: DroneLogisticsResponse): TonedValueViewModel {
  return {
    value: paused ? configurationPageDroneLogisticsPausedValue : configurationPageDroneLogisticsRunningValue,
    tone: toneByDroneLogisticsEffect[effect],
    toneLabel: toneLabelByDroneLogisticsEffect[effect]
  };
}
