import {OptimizerResponse} from "../application/responses/EnergyLevelsResponse";
import {sumProductionRatios} from "./sumProductionRatios";

export interface OptimizerBoostSum {
  readonly contribution: number;
  readonly productionRatio?: number;
}

export function sumOptimizerBoost(optimizers: readonly OptimizerResponse[]): OptimizerBoostSum {
  return {
    contribution: optimizers.reduce((total, optimizer) => total + optimizer.contribution, 0),
    productionRatio: sumProductionRatios(optimizers.map((optimizer) => optimizer.productionRatio))
  };
}
