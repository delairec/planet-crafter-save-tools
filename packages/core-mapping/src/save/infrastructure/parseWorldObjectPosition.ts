const POSITION_SEPARATOR = ',';
const POSITION_AXES = 3;

export function parseWorldObjectPosition(position: string): [number, number, number] | undefined {
  const coordinates = position.split(POSITION_SEPARATOR).map(readCoordinate);
  if (coordinates.length !== POSITION_AXES || !coordinates.every(Number.isFinite)) {
    return undefined;
  }
  const [x, y, z] = coordinates;
  return [x, y, z];
}

function readCoordinate(coordinate: string): number {
  return coordinate.trim() === '' ? Number.NaN : Number(coordinate);
}
