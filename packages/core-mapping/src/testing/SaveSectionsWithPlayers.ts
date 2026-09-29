import {PlayerEntity} from "../domain/entities/PlayerEntity";
import {FakeSaveSectionsMapperService} from "./FakeSaveSectionsMapperService";

export class SaveSectionsWithPlayers extends FakeSaveSectionsMapperService {
  constructor(private readonly players: PlayerEntity[]) {
    super();
  }

  override getPlayers(): PlayerEntity[] {
    return this.players;
  }
}

export function createPlayerFlaggedAsHost(name: string, host: boolean): PlayerEntity {
  return new PlayerEntity({name, inventory: [], equipment: [], planetId: 'Prime', host});
}
