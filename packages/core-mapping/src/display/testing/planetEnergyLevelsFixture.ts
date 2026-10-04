import {PlanetEnergyLevelsResponse} from "../application/responses/EnergyLevelsResponse";
import {WorldObjectLabelsResponse} from "../application/responses/WorldObjectLabelsResponse";

export const WORLD_OBJECT_LABELS: WorldObjectLabelsResponse = {
  Drill2: 'Drill T3',
  EnergyGenerator3: 'Solar panel T2',
  EnergyGenerator5: 'Nuclear Reactor T2',
  Optimizer2: 'Machine Optimizer T2',
  WindTurbine1: 'Wind turbine T2',
  Generator01: 'Generator 01',
  Generator02: 'Generator 02',
  Generator03: 'Generator 03',
  Generator04: 'Generator 04',
  Generator05: 'Generator 05',
  Generator06: 'Generator 06',
  Generator07: 'Generator 07',
  Generator08: 'Generator 08',
  Generator09: 'Generator 09',
  Generator10: 'Generator 10',
  Generator11: 'Generator 11',
  Generator12: 'Generator 12',
  Generator13: 'Generator 13',
  Generator14: 'Generator 14',
  Generator15: 'Generator 15'
};

export const TIGHT_PLANET: PlanetEnergyLevelsResponse = {
  planetId: 1,
  planetName: 'Prime',
  production: 1_000,
  consumption: 950,
  available: 50,
  balance: 'tight',
  productionBreakdown: [
    {name: 'EnergyGenerator5', quantity: 2, unitLevel: 400, totalLevel: 800, productionRatio: 0.8},
    {name: 'EnergyGenerator3', quantity: 4, unitLevel: 50, totalLevel: 200, productionRatio: 0.2}
  ],
  consumptionBreakdown: [
    {name: 'Drill2', quantity: 5, unitLevel: 190, totalLevel: 950, productionRatio: 0.95}
  ],
  optimizers: [
    {name: 'Optimizer2', fuseCount: 3, fuseSlots: 4, boostedMachines: [{name: 'WindTurbine1', quantity: 2}, {name: 'Drill2', quantity: 1}], contribution: 100, productionRatio: 0.1}
  ]
};

export const IDLE_PLANET: PlanetEnergyLevelsResponse = {
  planetId: 3,
  production: 0,
  consumption: 0,
  available: 0,
  balance: 'balanced',
  productionBreakdown: [],
  consumptionBreakdown: [],
  optimizers: []
};

export const PLANET_WITH_FIFTEEN_TYPES_OF_PRODUCERS: PlanetEnergyLevelsResponse = {
  planetId: 4,
  production: 1_000,
  consumption: 0,
  available: 1_000,
  balance: 'surplus',
  productionBreakdown: [
    {name: 'Generator01', quantity: 1, unitLevel: 200, totalLevel: 200, productionRatio: 0.2},
    {name: 'Generator02', quantity: 1, unitLevel: 150, totalLevel: 150, productionRatio: 0.15},
    {name: 'Generator03', quantity: 1, unitLevel: 100, totalLevel: 100, productionRatio: 0.1},
    {name: 'Generator04', quantity: 1, unitLevel: 90, totalLevel: 90, productionRatio: 0.09},
    {name: 'Generator05', quantity: 1, unitLevel: 80, totalLevel: 80, productionRatio: 0.08},
    {name: 'Generator06', quantity: 1, unitLevel: 70, totalLevel: 70, productionRatio: 0.07},
    {name: 'Generator07', quantity: 1, unitLevel: 60, totalLevel: 60, productionRatio: 0.06},
    {name: 'Generator08', quantity: 1, unitLevel: 50, totalLevel: 50, productionRatio: 0.05},
    {name: 'Generator09', quantity: 1, unitLevel: 40, totalLevel: 40, productionRatio: 0.04},
    {name: 'Generator10', quantity: 1, unitLevel: 30, totalLevel: 30, productionRatio: 0.03},
    {name: 'Generator11', quantity: 1, unitLevel: 30, totalLevel: 30, productionRatio: 0.03},
    {name: 'Generator12', quantity: 1, unitLevel: 20, totalLevel: 20, productionRatio: 0.02},
    {name: 'Generator13', quantity: 1, unitLevel: 20, totalLevel: 20, productionRatio: 0.02},
    {name: 'Generator14', quantity: 1, unitLevel: 20, totalLevel: 20, productionRatio: 0.02},
    {name: 'Generator15', quantity: 1, unitLevel: 20, totalLevel: 20, productionRatio: 0.02}
  ],
  consumptionBreakdown: [],
  optimizers: [
    {name: 'Optimizer2', fuseCount: 1, fuseSlots: 4, boostedMachines: [{name: 'Generator01', quantity: 1}], contribution: 10, productionRatio: 0.01},
    {name: 'Optimizer2', fuseCount: 1, fuseSlots: 4, boostedMachines: [{name: 'Generator02', quantity: 1}], contribution: 10, productionRatio: 0.01}
  ]
};

export const PLANET_WITH_TWELVE_TYPES_OF_CONSUMERS: PlanetEnergyLevelsResponse = {
  planetId: 5,
  production: 1_000,
  consumption: 120,
  available: 880,
  balance: 'surplus',
  productionBreakdown: [],
  consumptionBreakdown: [
    {name: 'Generator01', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator02', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator03', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator04', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator05', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator06', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator07', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator08', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator09', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator10', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator11', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01},
    {name: 'Generator12', quantity: 1, unitLevel: 10, totalLevel: 10, productionRatio: 0.01}
  ],
  optimizers: []
};
