import {UseCase} from "../../save/application/UseCase";
import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {computeGaugePercentage, GaugeReading} from "../domain/rules/computeGaugePercentage";
import {resolveOxygenCapacity} from "../domain/rules/resolveOxygenCapacity";
import {PLAYER_BASE_GAUGE_CAPACITY} from "../domain/playerGaugeCapacity";
import {OxygenTankCapacitiesByWorldObjectName} from "../domain/valueObjects/OxygenTankCapacityValueObject";
import {OxygenTankCapacitiesReaderPort} from './ports/OxygenTankCapacitiesReaderPort';
import {PlayersPagePresenterPort} from './ports/PlayersPagePresenterPort';
import {SaveSectionsReaderPort} from './ports/SaveSectionsReaderPort';
import {WorldObjectLabelsReaderPort} from './ports/WorldObjectLabelsReaderPort';
import {LoadSaveSectionsRequest} from './requests/LoadSaveSectionsRequest';
import {PlayerCardResponse, PlayerGaugeResponse} from './responses/PlayersPageResponse';

export interface PlayersPageReaders {
  readonly saveSectionsReader: SaveSectionsReaderPort;
  readonly worldObjectLabelsReader: WorldObjectLabelsReaderPort;
  readonly oxygenTankCapacitiesReader: OxygenTankCapacitiesReaderPort;
}

export class LoadPlayersPage implements UseCase<LoadSaveSectionsRequest> {
  constructor(
    private readonly readers: PlayersPageReaders,
    private readonly presenter: PlayersPagePresenterPort,
  ) {}

  async execute({content}: LoadSaveSectionsRequest): Promise<void> {
    const {saveSections, unreadableLines} = this.readers.saveSectionsReader.read(content);

    if (unreadableLines.length > 0) {
      this.presenter.displaySaveWithUnreadableLines({unreadableLines});
      return;
    }

    const oxygenTankCapacities = this.readers.oxygenTankCapacitiesReader.readOxygenTankCapacities();
    const players = saveSections.getPlayers().map((player) => createPlayerCard(player, oxygenTankCapacities));

    this.presenter.displayPlayersPage({players, worldObjectLabels: this.readers.worldObjectLabelsReader.readWorldObjectLabels()});
  }
}

function createPlayerCard(player: PlayerEntity, oxygenTankCapacities: OxygenTankCapacitiesByWorldObjectName): PlayerCardResponse {
  const oxygenCapacity = resolveOxygenCapacity({equipment: player.equipment, oxygenTankCapacities});
  return {
    name: player.name,
    planet: player.planetId,
    isHost: player.isHost,
    gauges: {
      oxygen: measureGauge({value: player.gauges.oxygen, maximum: oxygenCapacity}),
      health: measureGauge({value: player.gauges.health, maximum: PLAYER_BASE_GAUGE_CAPACITY}),
      thirst: measureGauge({value: player.gauges.thirst, maximum: PLAYER_BASE_GAUGE_CAPACITY})
    },
    equipment: player.equipment,
    inventory: player.inventory
  };
}

function measureGauge(reading: GaugeReading): PlayerGaugeResponse {
  return {...reading, percentage: computeGaugePercentage(reading)};
}
