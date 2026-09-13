import {WorldObjectEntity, WorldObjectEntityInput} from "../domain/entities/WorldObjectEntity";

export function createWholeSaveWorldObjects(...identifiedWorldObjects: readonly WorldObjectEntityInput[]): WorldObjectEntity[] {
  return identifiedWorldObjects.map((worldObject) => new WorldObjectEntity(worldObject));
}
