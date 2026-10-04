import {describe, expect, it} from 'bun:test';
import {checkEquipmentIcons, findUndrawnEquipmentIcons, type EquipmentIconRow} from './check-equipment-icons.ts';
import {createFakeScriptIo} from '../../common/testing/createFakeScriptIo.ts';

const SPRITE = '<svg xmlns="http://www.w3.org/2000/svg"><symbol id="oxygen-tank" viewBox="0 0 24 24"></symbol><symbol id="backpack" viewBox="0 0 24 24"></symbol></svg>';

describe('findUndrawnEquipmentIcons', () => {
  describe('When the sprite draws every icon the table names', () => {
    it('should find none', () => {
      // Arrange
      const rows: EquipmentIconRow[] = [{icon: 'oxygen-tank'}, {icon: 'oxygen-tank'}, {icon: 'backpack'}];

      // Act
      const undrawnIcons = findUndrawnEquipmentIcons(rows, SPRITE);

      // Assert
      expect(undrawnIcons).toEqual([]);
    });
  });

  describe('When the table names an icon the sprite does not draw', () => {
    it('should name that icon once, whatever the number of rows naming it', () => {
      // Arrange
      const rows: EquipmentIconRow[] = [{icon: 'jetpack'}, {icon: 'backpack'}, {icon: 'jetpack'}];

      // Act
      const undrawnIcons = findUndrawnEquipmentIcons(rows, SPRITE);

      // Assert
      expect(undrawnIcons).toEqual(['jetpack']);
    });
  });
});

describe('checkEquipmentIcons', () => {
  describe('When the sprite draws every icon of the equipment kinds table', () => {
    it('should say so and exit with zero', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-world-objects/equipmentKinds.json': '[{"worldObjectName": "Backpack1", "kind": "Backpack", "icon": "backpack"}]',
          'packages/ui-save-manager/public/icons/equipment.svg': SPRITE
        }
      });

      // Act
      await checkEquipmentIcons(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: ['check:equipment-icons: the sprite draws every icon the equipment kinds table names.'],
        exitCodes: [0]
      });
    });
  });

  describe('When the equipment kinds table names an icon the sprite does not draw', () => {
    it('should print the icon, then the count, and exit with one', async () => {
      // Arrange
      const {io, printed, exitCodes} = createFakeScriptIo({
        files: {
          'packages/data-world-objects/equipmentKinds.json': '[{"worldObjectName": "Jetpack1", "kind": "Jetpack", "icon": "jetpack"}]',
          'packages/ui-save-manager/public/icons/equipment.svg': SPRITE
        }
      });

      // Act
      await checkEquipmentIcons(io);

      // Assert
      expect({printed, exitCodes}).toEqual({
        printed: [
          'packages/data-world-objects/equipmentKinds.json names the icon jetpack, which packages/ui-save-manager/public/icons/equipment.svg does not draw',
          'check:equipment-icons: 1 icon(s) the sprite does not draw.'
        ],
        exitCodes: [1]
      });
    });
  });
});
