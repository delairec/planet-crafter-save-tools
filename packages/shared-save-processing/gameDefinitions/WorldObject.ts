/**
 * Wire DTO mirroring section 3 of the save format. Field names are the game's, abbreviations
 * included; the domain translates them into business language at its boundary.
 */
export interface WorldObject {
  id: number;
  gId: string;
  pos?: string;
  rot?: string;
  planet?: number;
  count?: string;
  grwth?: number;
  pnls?: string;
  color?: string;
  trtInd?: number;
  liId?: number;
  liPlanet?: number;
  text?: string;
  liGrps?: string;
  linkedWo?: number;
  siIds?: string;
  woIds?: string;
  trtVal?: number;
  hunger?: number;
  set?: number;
}
