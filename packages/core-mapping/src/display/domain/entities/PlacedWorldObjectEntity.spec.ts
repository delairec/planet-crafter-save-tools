import {describe, expect, it} from 'bun:test';
import {PlacedWorldObjectEntity} from './PlacedWorldObjectEntity';
import {WorldObjectEntity} from './WorldObjectEntity';
import {WorldObjectName} from '../worldObjectNames';
import {EnergyLevelsByWorldObjectName} from '../energyLevelsByWorldObjectName';
import {OptimizerRangeValueObject} from '../valueObjects/OptimizerRangeValueObject';

describe('PlacedWorldObjectEntity', () => {
  it('should expose the placement it was built from', () => {
    // Arrange
    const input = {
      id: '1',
      name: 'Drill0' as const,
      position: [1, 2, 3] as [number, number, number],
      planetId: 1,
      inventoryId: 5
    };

    // Act
    const placedWorldObject = new PlacedWorldObjectEntity(input);

    // Assert
    expect(placedWorldObject.id).toBe('1');
    expect(placedWorldObject.name).toBe('Drill0');
    expect(placedWorldObject.position).toEqual([1, 2, 3]);
    expect(placedWorldObject.planetId).toBe(1);
    expect(placedWorldObject.inventoryId).toBe(5);
  });

  describe('When an optimizer picks the producers it boosts', () => {
    const optimizer = new PlacedWorldObjectEntity({
      id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1
    });
    const range: OptimizerRangeValueObject = {radius: 120, maxMachines: 5, fuseSlots: 1};
    const productionLevels: EnergyLevelsByWorldObjectName = {EnergyGenerator1: 1.2};

    function producerAt(id: string, distance: number, planetId = 1): PlacedWorldObjectEntity {
      return new PlacedWorldObjectEntity({
        id, name: 'EnergyGenerator1' as WorldObjectName, position: [distance, 0, 0], planetId
      });
    }

    it('should boost a producer standing within its radius', () => {
      // Arrange
      const producer = producerAt('prod-1', 119);

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([producer], range, productionLevels);

      // Assert
      expect(boostedProducers).toEqual([producer]);
    });

    it('should not boost a producer standing beyond its radius', () => {
      // Arrange
      const producer = producerAt('prod-1', 121);

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([producer], range, productionLevels);

      // Assert
      expect(boostedProducers).toEqual([]);
    });

    it('should not boost a producer standing on another planet', () => {
      // Arrange
      const producer = producerAt('prod-1', 10, 2);

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([producer], range, productionLevels);

      // Assert
      expect(boostedProducers).toEqual([]);
    });

    it('should not boost a machine that produces no energy', () => {
      // Arrange
      const drill = new PlacedWorldObjectEntity({
        id: 'drill-1', name: 'Drill0' as WorldObjectName, position: [10, 0, 0], planetId: 1
      });

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([drill], range, productionLevels);

      // Assert
      expect(boostedProducers).toEqual([]);
    });

    it('should keep the closest producers up to its machine capacity', () => {
      // Arrange
      const producerAtTen = producerAt('prod-10', 10);
      const producerAtTwenty = producerAt('prod-20', 20);
      const producerAtThirty = producerAt('prod-30', 30);
      const producerAtForty = producerAt('prod-40', 40);
      const producerAtFifty = producerAt('prod-50', 50);
      const producerAtSixty = producerAt('prod-60', 60);

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([
        producerAtSixty, producerAtTen, producerAtFifty, producerAtTwenty, producerAtForty, producerAtThirty
      ], range, productionLevels);

      // Assert
      expect(boostedProducers).toEqual([
        producerAtTen, producerAtTwenty, producerAtThirty, producerAtForty, producerAtFifty
      ]);
    });
  });

  describe('When its position is read', () => {
    it('should hand out a fresh copy on each read', () => {
      // Arrange
      const worldObject = new PlacedWorldObjectEntity({
        id: 'wo-1', name: 'Drill0' as const, position: [1, 2, 3], planetId: 1
      });

      // Act
      const [firstRead, secondRead] = [worldObject.position, worldObject.position];

      // Assert
      expect(firstRead).not.toBe(secondRead);
      expect(firstRead).toEqual([1, 2, 3]);
    });
  });

  it('should be a world object of the whole save', () => {
    // Arrange
    const input = {id: '1', name: 'Drill0' as const, position: [1, 2, 3] as [number, number, number], planetId: 1};

    // Act
    const placedWorldObject = new PlacedWorldObjectEntity(input);

    // Assert
    expect(placedWorldObject).toBeInstanceOf(WorldObjectEntity);
  });
});
