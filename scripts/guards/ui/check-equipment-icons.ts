import {runAsEntryPoint, type ScriptIo} from '../../common/scriptIo.ts';
import {reportViolations} from '../common/specSources.ts';

const EQUIPMENT_KINDS_PATH = 'packages/data-world-objects/equipmentKinds.json';
const EQUIPMENT_SPRITE_PATH = 'packages/ui-save-manager/src/components/players/EquipmentIconSprite.tsx';
const SYMBOL_ID = /<symbol\b[^>]*\bid="([^"]+)"/g;
const CHECK_NAME = 'check:equipment-icons';

export interface EquipmentIconRow {
  icon: string;
}

export function findUndrawnEquipmentIcons(rows: EquipmentIconRow[], sprite: string): string[] {
  const drawnIcons = new Set([...sprite.matchAll(SYMBOL_ID)].map(([, id]) => id));
  const namedIcons = new Set(rows.map(({icon}) => icon));
  return [...namedIcons].filter((icon) => !drawnIcons.has(icon));
}

export async function checkEquipmentIcons(io: ScriptIo): Promise<void> {
  const rows: EquipmentIconRow[] = JSON.parse(await io.readText(EQUIPMENT_KINDS_PATH));
  const sprite = await io.readText(EQUIPMENT_SPRITE_PATH);
  reportViolations(io, {
    checkName: CHECK_NAME,
    violations: findUndrawnEquipmentIcons(rows, sprite).map(
      (icon) => `${EQUIPMENT_KINDS_PATH} names the icon ${icon}, which ${EQUIPMENT_SPRITE_PATH} does not draw`
    ),
    nothingFound: 'the sprite draws every icon the equipment kinds table names.',
    summarize: (count) => `${count} icon(s) the sprite does not draw.`
  });
}

await runAsEntryPoint(import.meta.main, checkEquipmentIcons);
