import type { EmissionFactors, ModelInputs, UnitCosts } from "@/lib/model/types";
import {
  THESIS_BATCH_SIZE,
  THESIS_MASS_REDUCTION,
  THESIS_TRANSPORT_KM,
} from "@/lib/model/panelGeometry";

export interface MidwestPreset {
  id: string;
  label: string;
  description: string;
  transportKmOneWay: number;
  emissionFactors: EmissionFactors;
  unitCosts: UnitCosts;
}

export const THESIS_EMISSION_FACTORS: EmissionFactors = {
  cementKgCo2PerKg: 0.82,
  virginAggregateKgCo2PerKg: 0.005,
  recycledAggregateKgCo2PerKg: 0.002,
  foamCreteKgCo2PerKg: 0.15,
  truckingKgCo2PerKmPerLoad: 0.62,
  manufacturingKgCo2PerKwh: 0.45,
  manufacturingKwhPerPanel: 8.5,
};

export const THESIS_UNIT_COSTS: UnitCosts = {
  cementPerKg: 0.18,
  sandPerKg: 0.025,
  polymerPerKg: 3.5,
  foamAgentPerKg: 4.2,
  acceleratorPerKg: 6.0,
  recycledRubblePerTonne: 12,
  formworkPerPanel: 18,
  laborPerPanel: 42,
  truckingPerKm: 2.5,
  truckingBasePerLoad: 150,
};

export const MIDWEST_EMISSION_FACTORS: EmissionFactors = {
  ...THESIS_EMISSION_FACTORS,
  manufacturingKgCo2PerKwh: 0.45,
};

export const MIDWEST_UNIT_COSTS: UnitCosts = {
  ...THESIS_UNIT_COSTS,
  cementPerKg: 0.17,
  recycledRubblePerTonne: 10,
  truckingPerKm: 2.35,
};

export function createDefaultInputs(
  overrides: Partial<ModelInputs> = {},
): ModelInputs {
  return {
    panelCount: THESIS_BATCH_SIZE,
    batchSize: THESIS_BATCH_SIZE,
    transportKmOneWay: THESIS_TRANSPORT_KM,
    roundTrip: true,
    optimizationMassReduction: THESIS_MASS_REDUCTION,
    recycledAggregatePct: 1,
    foamCreteFillRatio: 0.45,
    scenario: "optimized",
    emissionFactors: { ...THESIS_EMISSION_FACTORS },
    unitCosts: { ...THESIS_UNIT_COSTS },
    carbonPricePerTonne: 0,
    ...overrides,
  };
}

export const THESIS_PRESET: MidwestPreset = {
  id: "thesis",
  label: "Thesis Default (Figure 9)",
  description: "150 km one-way, 26-panel flatbed batch, ACADIA submission assumptions.",
  transportKmOneWay: THESIS_TRANSPORT_KM,
  emissionFactors: THESIS_EMISSION_FACTORS,
  unitCosts: THESIS_UNIT_COSTS,
};

export const MIDWEST_BASE_PRESET: MidwestPreset = {
  id: "midwest",
  label: "Midwest Regional Average",
  description: "MISO grid factors and NRMCA-style Midwest material cost placeholders.",
  transportKmOneWay: 100,
  emissionFactors: MIDWEST_EMISSION_FACTORS,
  unitCosts: MIDWEST_UNIT_COSTS,
};
