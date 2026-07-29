import type { ModelInputs } from "./types";

function finiteNonnegative(value: number, fallback = 0): number {
  return Number.isFinite(value) ? Math.max(value, 0) : fallback;
}

function finitePositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function ratio(value: number, fallback = 0): number {
  return Math.min(finiteNonnegative(value, fallback), 1);
}

function normalizeRecord<T extends object>(record: T): T {
  return Object.fromEntries(
    Object.entries(record as Record<string, number>).map(([key, value]) => [
      key,
      finiteNonnegative(value),
    ]),
  ) as T;
}

export function normalizeModelInputs(inputs: ModelInputs): ModelInputs {
  return {
    ...inputs,
    panelCount: Math.round(finiteNonnegative(inputs.panelCount)),
    batchSize: Math.round(finitePositive(inputs.batchSize, 1)),
    transportKmOneWay: finiteNonnegative(inputs.transportKmOneWay),
    recycledMaterialTransportKmOneWay: finiteNonnegative(
      inputs.recycledMaterialTransportKmOneWay,
    ),
    recycledAggregateTruckCapacityKg: finitePositive(
      inputs.recycledAggregateTruckCapacityKg,
      18_000,
    ),
    optimizationMassReduction: Math.min(
      finiteNonnegative(inputs.optimizationMassReduction),
      0.33,
    ),
    recycledAggregatePct: ratio(inputs.recycledAggregatePct),
    foamCreteFillRatio: Math.min(finiteNonnegative(inputs.foamCreteFillRatio), 0.85),
    carbonPricePerTonne: finiteNonnegative(inputs.carbonPricePerTonne),
    emissionFactors: normalizeRecord(inputs.emissionFactors),
    unitCosts: normalizeRecord(inputs.unitCosts),
  };
}
