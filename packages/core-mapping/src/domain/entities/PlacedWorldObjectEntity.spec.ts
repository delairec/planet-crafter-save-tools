import {describe, expect, it} from 'bun:test';
import {PlacedWorldObjectEntity} from './PlacedWorldObjectEntity';
import {InvalidSaveDataError} from '../errors/InvalidSaveDataError';
import {WorldObjectEntity} from './WorldObjectEntity';
import {WorldObjectName} from '../worldObjectNames';

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

  it('should reject a position containing NaN', () => {
    // Arrange
    const input = {id: '1', name: 'Drill0' as const, position: [NaN, 2, 3] as [number, number, number], planetId: 1};

    // Act & Assert
    expect(() => new PlacedWorldObjectEntity(input)).toThrow(InvalidSaveDataError);
  });

  describe('When asked what it does with energy', () => {
    it('should report the production level of the machine it is', () => {
      // Arrange
      const producer = new PlacedWorldObjectEntity({
        id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });

      // Act & Assert
      expect(producer.energyProductionLevel).toBe(1.2);
      expect(producer.energyConsumptionLevel).toBeUndefined();
    });

    it('should report the consumption level of the machine it is', () => {
      // Arrange
      const consumer = new PlacedWorldObjectEntity({
        id: '1', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });

      // Act & Assert
      expect(consumer.energyConsumptionLevel).toBe(0.5);
      expect(consumer.energyProductionLevel).toBeUndefined();
    });

    it('should be an optimizer when it is one of the optimizer machines', () => {
      // Arrange
      const optimizer = new PlacedWorldObjectEntity({
        id: '1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });
      const drill = new PlacedWorldObjectEntity({
        id: '2', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });

      // Act & Assert
      expect(optimizer.isOptimizer()).toBe(true);
      expect(drill.isOptimizer()).toBe(false);
    });
  });

  describe('When an optimizer picks the producers it boosts', () => {
    const optimizer = new PlacedWorldObjectEntity({
      id: 'opt-1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1
    });

    function producerAt(id: string, distance: number, planetId = 1): PlacedWorldObjectEntity {
      return new PlacedWorldObjectEntity({
        id, name: 'EnergyGenerator1' as WorldObjectName, position: [distance, 0, 0], planetId
      });
    }

    it('should boost a producer standing within its radius', () => {
      // Arrange
      const producer = producerAt('prod-1', 119);

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([producer]);

      // Assert
      expect(boostedProducers).toEqual([producer]);
    });

    it('should not boost a producer standing beyond its radius', () => {
      // Arrange
      const producer = producerAt('prod-1', 121);

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([producer]);

      // Assert
      expect(boostedProducers).toEqual([]);
    });

    it('should not boost a producer standing on another planet', () => {
      // Arrange
      const producer = producerAt('prod-1', 10, 2);

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([producer]);

      // Assert
      expect(boostedProducers).toEqual([]);
    });

    it('should not boost a machine that produces no energy', () => {
      // Arrange
      const drill = new PlacedWorldObjectEntity({
        id: 'drill-1', name: 'Drill0' as WorldObjectName, position: [10, 0, 0], planetId: 1
      });

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([drill]);

      // Assert
      expect(boostedProducers).toEqual([]);
    });

    it('should keep the closest producers up to its machine capacity', () => {
      // Arrange
      const producers = [60, 10, 50, 20, 40, 30].map((distance) => producerAt(`prod-${distance}`, distance));

      // Act
      const boostedProducers = optimizer.boostedProducersAmong(producers);

      // Assert
      expect(boostedProducers.map((producer) => producer.id)).toEqual([
        'prod-10', 'prod-20', 'prod-30', 'prod-40', 'prod-50'
      ]);
    });

    it('should boost nothing when it is not an optimizer', () => {
      // Arrange
      const drill = new PlacedWorldObjectEntity({
        id: 'drill-1', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });

      // Act
      const boostedProducers = drill.boostedProducersAmong([producerAt('prod-1', 10)]);

      // Assert
      expect(boostedProducers).toEqual([]);
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
