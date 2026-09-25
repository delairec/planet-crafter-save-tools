import {selectEnergyLevelsOfDeclaredVersion} from './energyLevelsByWorldObjectName';
import {describe, expect, it} from 'bun:test';
import {PlanetEnergyGrid} from './PlanetEnergyGrid';
import {PlacedWorldObjectEntity} from './entities/PlacedWorldObjectEntity';
import {WorldObjectEntity} from './entities/WorldObjectEntity';
import {InventoryEntity} from './entities/InventoryEntity';
import {WorldObjectName, worldObjectNamesByEnergyRole} from './worldObjectNames';
import {createPlanetWorldObjectsValueObject} from './valueObjects/EnergyLevelsRawDataValueObject';

const PLANET_ID = 1;

function placedWorldObject(
  id: string,
  name: string,
  position: [number, number, number] = [0, 0, 0],
  planetId: number = PLANET_ID,
  inventoryId?: number
): PlacedWorldObjectEntity {
  return new PlacedWorldObjectEntity({id, name: name as WorldObjectName, position, planetId, inventoryId});
}

function energyFuse(id: string): WorldObjectEntity {
  return new WorldObjectEntity({id, name: 'FuseEnergy1' as WorldObjectName});
}

function gridOf(
  placedWorldObjects: readonly PlacedWorldObjectEntity[],
  allWorldObjects: readonly WorldObjectEntity[] = placedWorldObjects,
  inventories: readonly InventoryEntity[] = [],
  planetName?: string
): PlanetEnergyGrid {
  return new PlanetEnergyGrid(
    createPlanetWorldObjectsValueObject({planetId: PLANET_ID, planetName, placedWorldObjects}),
    allWorldObjects,
    inventories,
    selectEnergyLevelsOfDeclaredVersion('2.103')
  );
}

describe('PlanetEnergyGrid', () => {
  it('should carry the identity of the planet it is the grid of', () => {
    // Arrange
    const grid = gridOf([placedWorldObject('1', 'EnergyGenerator1')], undefined, [], 'Prime');

    // Act
    const levels = grid.levels();

    // Assert
    expect(levels.planetId).toBe(PLANET_ID);
    expect(levels.planetName).toBe('Prime');
  });

  describe('When it adds up what the planet produces', () => {
    it('should sum the base production of the placed world objects with known production levels', () => {
      // Arrange
      const grid = gridOf([
        placedWorldObject('1', 'EnergyGenerator1'),
        placedWorldObject('2', 'EnergyGenerator2', [1, 0, 0])
      ]);

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.production).toBe(1.2 + 6.5);
    });

    it('should ignore the placed world objects with no known production level', () => {
      // Arrange
      const grid = gridOf([
        placedWorldObject('1', 'EnergyGenerator1'),
        placedWorldObject('2', 'Drill0', [1, 0, 0])
      ]);

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.production).toBe(1.2);
    });

    const {producing, consuming, withoutKnownEnergyLevel} = worldObjectNamesByEnergyRole;

    const aloneOnThePlanet = (name: WorldObjectName) => gridOf([placedWorldObject(name, name)]).levels();

    it.each([...producing])('should read a strictly positive production level for %s', (name) => {
      // Act
      const levels = aloneOnThePlanet(name);

      // Assert
      expect(levels.production).toBeGreaterThan(0);
    });

    it.each([...consuming])('should charge %s, a world object grouped as an energy consumer', (name) => {
      // Act
      const levels = aloneOnThePlanet(name);

      // Assert
      expect(levels.consumption).toBeGreaterThan(0);
    });

    it('should neither produce nor charge for the world objects without a known energy level', () => {
      // Act
      const withALevel = withoutKnownEnergyLevel.filter((name) => {
        const levels = aloneOnThePlanet(name);
        return levels.production > 0 || levels.consumption > 0;
      });

      // Assert
      expect(withALevel).toEqual([]);
    });
  });

  describe('When it adds up what the planet consumes', () => {
    it('should sum the consumption of the placed world objects with known consumption levels', () => {
      // Arrange
      const grid = gridOf([
        placedWorldObject('1', 'Drill0'),
        placedWorldObject('2', 'Heater1', [1, 0, 0])
      ]);

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.consumption).toBe(1.5);
    });

    it('should ignore the placed world objects with no known consumption level', () => {
      // Arrange
      const grid = gridOf([
        placedWorldObject('1', 'Drill0'),
        placedWorldObject('2', 'EnergyGenerator1', [1, 0, 0])
      ]);

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.consumption).toBe(0.5);
    });
  });

  it('should report available energy as production minus consumption', () => {
    // Arrange
    const grid = gridOf([
      placedWorldObject('1', 'EnergyGenerator1'),
      placedWorldObject('2', 'Drill0', [0, 10, 0])
    ]);

    // Act
    const levels = grid.levels();

    // Assert
    expect(levels.production).toBe(1.2);
    expect(levels.consumption).toBe(0.5);
    expect(levels.available).toBe(0.7);
  });

  it('should report an empty grid for a planet with no placed world object', () => {
    // Arrange
    const grid = gridOf([]);

    // Act
    const levels = grid.levels();

    // Assert
    expect(levels.production).toBe(0);
    expect(levels.consumption).toBe(0);
    expect(levels.available).toBe(0);
    expect(levels.productionBreakdown).toEqual([]);
    expect(levels.consumptionBreakdown).toEqual([]);
    expect(levels.optimizers).toEqual([]);
  });

  describe('When an optimizer holding energy fuses reaches a producer', () => {
    it('should apply the energy fuse multiplier to the producer it boosts', () => {
      // Arrange
      const optimizer = placedWorldObject('opt-1', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
      const producer = placedWorldObject('prod-1', 'EnergyGenerator2', [1, 0, 0]);
      const fuse = energyFuse('fuse-1');
      const grid = gridOf(
        [optimizer, producer],
        [optimizer, producer, fuse],
        [new InventoryEntity({id: 99, worldObjectIds: ['fuse-1'], size: 1})]
      );

      // Act
      const levels = grid.levels();

      // Assert
      const oneAndAHalfTimesTheProducerBaseLevel = 9.75;
      expect(levels.production).toBe(oneAndAHalfTimesTheProducerBaseLevel);
    });

    it('should stack several energy fuses held by the same optimizer (Rule EN-FUSE-3)', () => {
      // Arrange
      const optimizer = placedWorldObject('opt-1', 'Optimizer2', [0, 0, 0], PLANET_ID, 99);
      const producer = placedWorldObject('prod-1', 'EnergyGenerator2', [10, 0, 0]);
      const firstFuse = energyFuse('fuse-1');
      const secondFuse = energyFuse('fuse-2');
      const grid = gridOf(
        [optimizer, producer],
        [optimizer, producer, firstFuse, secondFuse],
        [new InventoryEntity({id: 99, worldObjectIds: ['fuse-1', 'fuse-2'], size: 3})]
      );

      // Act
      const levels = grid.levels();

      // Assert
      const threeTimesTheProducerBaseLevel = 19.5;
      expect(levels.production).toBe(threeTimesTheProducerBaseLevel);
    });

    it('should sum the fuse counts of every optimizer reaching the same producer (Rule EN-OPT-3)', () => {
      // Arrange
      const optimizerA = placedWorldObject('opt-a', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
      const optimizerB = placedWorldObject('opt-b', 'Optimizer1', [2, 0, 0], PLANET_ID, 98);
      const producer = placedWorldObject('prod-1', 'EnergyGenerator1', [1, 0, 0]);
      const grid = gridOf(
        [optimizerA, optimizerB, producer],
        [optimizerA, optimizerB, producer, energyFuse('fuse-a'), energyFuse('fuse-b1'), energyFuse('fuse-b2')],
        [
          new InventoryEntity({id: 99, worldObjectIds: ['fuse-a'], size: 1}),
          new InventoryEntity({id: 98, worldObjectIds: ['fuse-b1', 'fuse-b2'], size: 2})
        ]
      );

      // Act
      const levels = grid.levels();

      // Assert
      const threeFusesOnTheProducerBaseLevel = 1.2 * 3 * 1.5;
      expect(levels.production).toBe(threeFusesOnTheProducerBaseLevel);
    });

    it('should leave a producer no optimizer reaches at its base production', () => {
      // Arrange
      const producer = placedWorldObject('prod-1', 'EnergyGenerator1', [1, 0, 0]);
      const grid = gridOf([producer]);

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.production).toBe(1.2);
    });
  });

  describe('When it reports the optimizers of the planet', () => {
    it('should report the boosted machine and the extra production the optimizer contributes', () => {
      // Arrange
      const optimizer = placedWorldObject('opt-1', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
      const producer = placedWorldObject('prod-1', 'EnergyGenerator1', [1, 0, 0]);
      const grid = gridOf(
        [optimizer, producer],
        [optimizer, producer, energyFuse('fuse-1')],
        [new InventoryEntity({id: 99, worldObjectIds: ['fuse-1'], size: 1})]
      );

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.optimizers).toHaveLength(1);
      expect(levels.optimizers[0]?.name).toBe('Optimizer1');
      expect(levels.optimizers[0]?.fuseCount).toBe(1);
      expect(levels.optimizers[0]?.boostedMachines).toEqual([{name: 'EnergyGenerator1', quantity: 1}]);
      expect(levels.optimizers[0]?.contribution).toBe(0.6);
    });

    describe('When the optimizer reaches no producer', () => {
      it('should report zero contribution and no boosted machine', () => {
        // Arrange
        const optimizer = placedWorldObject('opt-1', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
        const grid = gridOf(
          [optimizer],
          [optimizer, energyFuse('fuse-1')],
          [new InventoryEntity({id: 99, worldObjectIds: ['fuse-1'], size: 1})]
        );

        // Act
        const levels = grid.levels();

        // Assert
        expect(levels.optimizers).toEqual([{
          name: 'Optimizer1',
          fuseCount: 1,
          boostedMachines: [],
          contribution: 0,
          productionRatio: undefined
        }]);
      });
    });

    it('should split the total boost of a producer between its optimizers, proportionally to their fuse count', () => {
      // Arrange
      const optimizerA = placedWorldObject('opt-a', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
      const optimizerB = placedWorldObject('opt-b', 'Optimizer1', [2, 0, 0], PLANET_ID, 98);
      const producer = placedWorldObject('prod-1', 'EnergyGenerator1', [1, 0, 0]);
      const grid = gridOf(
        [optimizerA, optimizerB, producer],
        [optimizerA, optimizerB, producer, energyFuse('fuse-a'), energyFuse('fuse-b1'), energyFuse('fuse-b2')],
        [
          new InventoryEntity({id: 99, worldObjectIds: ['fuse-a'], size: 1}),
          new InventoryEntity({id: 98, worldObjectIds: ['fuse-b1', 'fuse-b2'], size: 2})
        ]
      );

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.optimizers).toMatchObject([
        {name: 'Optimizer1', fuseCount: 1, boostedMachines: [{name: 'EnergyGenerator1', quantity: 1}], contribution: 1.4},
        {name: 'Optimizer1', fuseCount: 2, boostedMachines: [{name: 'EnergyGenerator1', quantity: 1}], contribution: 2.8}
      ]);
    });

    it('should ignore an optimizer holding no energy fuse', () => {
      // Arrange
      const optimizer = placedWorldObject('opt-1', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
      const producer = placedWorldObject('prod-1', 'EnergyGenerator1', [1, 0, 0]);
      const grid = gridOf(
        [optimizer, producer],
        [optimizer, producer],
        [new InventoryEntity({id: 99, worldObjectIds: [], size: 1})]
      );

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.optimizers).toEqual([]);
      expect(levels.production).toBe(1.2);
    });

    it('should ignore an optimizer whose inventory cannot be found', () => {
      // Arrange
      const optimizer = placedWorldObject('opt-1', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
      const grid = gridOf([optimizer], [optimizer, energyFuse('fuse-1')], []);

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.optimizers).toEqual([]);
    });
  });

  describe('When it breaks the levels down by machine', () => {
    it('should express each production breakdown entry as a share of the total production', () => {
      // Arrange
      const grid = gridOf([
        placedWorldObject('1', 'EnergyGenerator2'),
        placedWorldObject('2', 'EnergyGenerator3', [0, 10, 0])
      ]);

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.production).toBe(26);
      expect(levels.productionBreakdown).toEqual([
        {name: 'EnergyGenerator3', quantity: 1, unitLevel: 19.5, totalLevel: 19.5, productionRatio: 0.75},
        {name: 'EnergyGenerator2', quantity: 1, unitLevel: 6.5, totalLevel: 6.5, productionRatio: 0.25}
      ]);
    });

    it('should express each optimizer contribution as a share of the total production', () => {
      // Arrange
      const optimizer = placedWorldObject('opt-1', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
      const boostedProducer = placedWorldObject('prod-1', 'WindTurbine1', [10, 0, 0]);
      const producerOutOfRadius = placedWorldObject('prod-2', 'WindTurbine1', [200, 0, 0]);
      const grid = gridOf(
        [optimizer, boostedProducer, producerOutOfRadius],
        [optimizer, boostedProducer, producerOutOfRadius, energyFuse('fuse-1')],
        [new InventoryEntity({id: 99, worldObjectIds: ['fuse-1'], size: 1})]
      );

      // Act
      const levels = grid.levels();

      // Assert
      expect(levels.production).toBe(725);
      expect(levels.optimizers).toEqual([{
        name: 'Optimizer1',
        fuseCount: 1,
        boostedMachines: [{name: 'WindTurbine1', quantity: 1}],
        contribution: 145,
        productionRatio: 0.2
      }]);
    });

    describe('When the planet produces no energy', () => {
      it('should leave the production shares undefined', () => {
        // Arrange
        const optimizer = placedWorldObject('opt-1', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
        const grid = gridOf(
          [optimizer],
          [optimizer, energyFuse('fuse-1')],
          [new InventoryEntity({id: 99, worldObjectIds: ['fuse-1'], size: 1})]
        );

        // Act
        const levels = grid.levels();

        // Assert
        expect(levels.production).toBe(0);
        expect(levels.optimizers[0]?.productionRatio).toBeUndefined();
      });
    });

    describe('When several optimizers holding energy fuses share a producer', () => {
      function createGridWithTwoOptimizersSharingAProducer(): PlanetEnergyGrid {
        const optimizerWithOneFuse = placedWorldObject('opt-a', 'Optimizer1', [0, 0, 0], PLANET_ID, 99);
        const optimizerWithThreeFuses = placedWorldObject('opt-b', 'Optimizer2', [200, 0, 0], PLANET_ID, 98);
        const producerReachedByBothOptimizers = placedWorldObject('prod-1', 'WindTurbine1', [100, 0, 0]);
        const producerReachedByOneOptimizer = placedWorldObject('prod-2', 'EnergyGenerator5', [400, 0, 0]);
        const producerReachedByNoOptimizer = placedWorldObject('prod-3', 'EnergyGenerator3', [-500, 0, 0]);
        const placedWorldObjects = [
          optimizerWithOneFuse,
          optimizerWithThreeFuses,
          producerReachedByBothOptimizers,
          producerReachedByOneOptimizer,
          producerReachedByNoOptimizer
        ];

        return gridOf(
          placedWorldObjects,
          [
            ...placedWorldObjects,
            energyFuse('fuse-a'),
            energyFuse('fuse-b1'),
            energyFuse('fuse-b2'),
            energyFuse('fuse-b3')
          ],
          [
            new InventoryEntity({id: 99, worldObjectIds: ['fuse-a'], size: 1}),
            new InventoryEntity({id: 98, worldObjectIds: ['fuse-b1', 'fuse-b2', 'fuse-b3'], size: 3})
          ]
        );
      }

      it('should add the machine levels and the optimizer contributions up to the production of the planet', () => {
        // Arrange
        const grid = createGridWithTwoOptimizersSharingAProducer();

        // Act
        const levels = grid.levels();

        // Assert
        const [generators5, windTurbines, generators3] = levels.productionBreakdown;
        const [optimizerWithOneFuse, optimizerWithThreeFuses] = levels.optimizers;
        expect(levels.production).toBe(3251.25);
        expect(
          generators5.totalLevel + windTurbines.totalLevel + generators3.totalLevel
          + optimizerWithOneFuse.contribution + optimizerWithThreeFuses.contribution
        ).toBe(3251.25);
      });

      it('should share the production of the planet between the machines and the optimizers', () => {
        // Arrange
        const grid = createGridWithTwoOptimizersSharingAProducer();

        // Act
        const levels = grid.levels();

        // Assert
        const [generators5, windTurbines, generators3] = levels.productionBreakdown;
        const [optimizerWithOneFuse, optimizerWithThreeFuses] = levels.optimizers;
        expect(
          generators5.productionRatio! + windTurbines.productionRatio! + generators3.productionRatio!
          + optimizerWithOneFuse.productionRatio! + optimizerWithThreeFuses.productionRatio!
        ).toBeCloseTo(1, 12);
      });
    });
  });

  it('should draw production and consumption from the planet alone, not from the whole save', () => {
    // Arrange
    const producerOnThePlanet = placedWorldObject('1', 'EnergyGenerator1');
    const producerOnAnotherPlanet = placedWorldObject('2', 'EnergyGenerator6', [0, 0, 0], 2);
    const consumerOnAnotherPlanet = placedWorldObject('3', 'Drill4', [10, 0, 0], 2);
    const grid = gridOf(
      [producerOnThePlanet],
      [producerOnThePlanet, producerOnAnotherPlanet, consumerOnAnotherPlanet]
    );

    // Act
    const levels = grid.levels();

    // Assert
    expect(levels.production).toBe(1.2);
    expect(levels.consumption).toBe(0);
    expect(levels.productionBreakdown).toEqual([
      {name: 'EnergyGenerator1', quantity: 1, unitLevel: 1.2, totalLevel: 1.2, productionRatio: 1}
    ]);
    expect(levels.consumptionBreakdown).toEqual([]);
  });
});
