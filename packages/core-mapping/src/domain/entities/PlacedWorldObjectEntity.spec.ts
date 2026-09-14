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

    // Act
    const buildPlacedWorldObject = () => new PlacedWorldObjectEntity(input);

    // Assert
    expect(buildPlacedWorldObject).toThrow(InvalidSaveDataError);
  });

  describe('When asked what it does with energy', () => {
    it('should report the production level of the machine it is', () => {
      // Arrange
      const producer = new PlacedWorldObjectEntity({
        id: '1', name: 'EnergyGenerator1' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });

      // Act
      const {energyProductionLevel, energyConsumptionLevel} = producer;

      // Assert
      expect(energyProductionLevel).toBe(1.2);
      expect(energyConsumptionLevel).toBeUndefined();
    });

    it('should report the consumption level of the machine it is', () => {
      // Arrange
      const consumer = new PlacedWorldObjectEntity({
        id: '1', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });

      // Act
      const {energyConsumptionLevel, energyProductionLevel} = consumer;

      // Assert
      expect(energyConsumptionLevel).toBe(0.5);
      expect(energyProductionLevel).toBeUndefined();
    });
  });

  describe('When it is one of the optimizer machines', () => {
    it('should be an optimizer', () => {
      // Arrange
      const optimizer = new PlacedWorldObjectEntity({
        id: '1', name: 'Optimizer1' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });

      // Act
      const anOptimizer = optimizer.isOptimizer();

      // Assert
      expect(anOptimizer).toBe(true);
    });
  });

  describe('When it is any other machine', () => {
    it('should not be an optimizer', () => {
      // Arrange
      const drill = new PlacedWorldObjectEntity({
        id: '2', name: 'Drill0' as WorldObjectName, position: [0, 0, 0], planetId: 1
      });

      // Act
      const anOptimizer = drill.isOptimizer();

      // Assert
      expect(anOptimizer).toBe(false);
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
      const producerAtTen = producerAt('prod-10', 10);
      const producerAtTwenty = producerAt('prod-20', 20);
      const producerAtThirty = producerAt('prod-30', 30);
      const producerAtForty = producerAt('prod-40', 40);
      const producerAtFifty = producerAt('prod-50', 50);
      const producerAtSixty = producerAt('prod-60', 60);

      // Act
      const boostedProducers = optimizer.boostedProducersAmong([
        producerAtSixty, producerAtTen, producerAtFifty, producerAtTwenty, producerAtForty, producerAtThirty
      ]);

      // Assert
      expect(boostedProducers).toEqual([
        producerAtTen, producerAtTwenty, producerAtThirty, producerAtForty, producerAtFifty
      ]);
    });

    describe('When it is not an optimizer', () => {
      it('should boost nothing', () => {
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
