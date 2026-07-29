import {
  computeMaterialBreakdown,
  computePanelMassKg,
  SCENARIO_LABELS,
  SOLID_PANEL_MASS_KG,
} from "./panelGeometry";
import { computeCarbonCost, computeMaterialCost } from "./economics";
import {
  computeTransportKm,
  computeTruckLoads,
} from "./transport";
import { normalizeModelInputs } from "./validation";
import type {
  CarbonBreakdown,
  CostBreakdown,
  MaterialBreakdown,
  ModelInputs,
  ModelOutputs,
  PanelScenario,
  ScenarioResult,
} from "./types";

function computeMaterialCarbon(
  materials: MaterialBreakdown,
  factors: ModelInputs["emissionFactors"],
): number {
  return (
    materials.cementKg * factors.cementKgCo2PerKg +
    materials.virginAggregateKg * factors.virginAggregateKgCo2PerKg +
    materials.recycledAggregateKg * factors.recycledAggregateKgCo2PerKg +
    materials.foamCreteKg * factors.foamCreteKgCo2PerKg +
    materials.sandKg * factors.sandKgCo2PerKg +
    materials.polymerKg * factors.polymerKgCo2PerKg +
    materials.foamAgentKg * factors.foamAgentKgCo2PerKg +
    materials.acceleratorKg * factors.acceleratorKgCo2PerKg
  );
}

function evaluateScenario(
  inputs: ModelInputs,
  scenario: PanelScenario,
  solidCarbonTotal?: number,
  solidCostTotal?: number,
): ScenarioResult {
  const panelMassKg = computePanelMassKg(
    scenario,
    inputs.optimizationMassReduction,
  );
  const materials = computeMaterialBreakdown(
    panelMassKg,
    inputs.recycledAggregatePct,
    inputs.foamCreteFillRatio,
    scenario,
  );

  const truckLoads = computeTruckLoads(inputs.panelCount, inputs.batchSize);
  const panelDeliveryKm = computeTransportKm(
    inputs.transportKmOneWay,
    inputs.roundTrip,
    truckLoads,
  );
  const recycledMaterialLoads = computeTruckLoads(
    materials.recycledAggregateKg * inputs.panelCount,
    inputs.recycledAggregateTruckCapacityKg,
  );
  const recycledMaterialKm = computeTransportKm(
    inputs.recycledMaterialTransportKmOneWay,
    inputs.roundTrip,
    recycledMaterialLoads,
  );
  const materialsKgCo2 = computeMaterialCarbon(materials, inputs.emissionFactors);
  const manufacturingKgCo2 =
    inputs.emissionFactors.manufacturingKwhPerPanel *
    inputs.emissionFactors.manufacturingKgCo2PerKwh *
    inputs.panelCount;
  const panelDeliveryKgCo2 =
    panelDeliveryKm * inputs.emissionFactors.truckingKgCo2PerKmPerLoad;
  const recycledMaterialTransportKgCo2 =
    recycledMaterialKm * inputs.emissionFactors.truckingKgCo2PerKmPerLoad;
  const transportKgCo2 = panelDeliveryKgCo2 + recycledMaterialTransportKgCo2;

  const carbon: CarbonBreakdown = {
    materialsKgCo2: materialsKgCo2 * inputs.panelCount,
    manufacturingKgCo2,
    transportKgCo2,
    panelDeliveryKgCo2,
    recycledMaterialTransportKgCo2,
    totalKgCo2:
      materialsKgCo2 * inputs.panelCount + manufacturingKgCo2 + transportKgCo2,
  };

  const materialsUsd = computeMaterialCost(materials, inputs.unitCosts) * inputs.panelCount;
  const formworkUsd = inputs.unitCosts.formworkPerPanel * inputs.panelCount;
  const laborUsd = inputs.unitCosts.laborPerPanel * inputs.panelCount;
  const panelDeliveryUsd =
    panelDeliveryKm * inputs.unitCosts.truckingPerKm +
    truckLoads * inputs.unitCosts.truckingBasePerLoad;
  const recycledMaterialTransportUsd =
    recycledMaterialKm * inputs.unitCosts.truckingPerKm +
    recycledMaterialLoads * inputs.unitCosts.truckingBasePerLoad;
  const transportUsd = panelDeliveryUsd + recycledMaterialTransportUsd;
  const carbonCostUsd = computeCarbonCost(
    carbon.totalKgCo2,
    inputs.carbonPricePerTonne,
  );

  const cost: CostBreakdown = {
    materialsUsd,
    formworkUsd,
    laborUsd,
    transportUsd,
    panelDeliveryUsd,
    recycledMaterialTransportUsd,
    carbonCostUsd,
    totalUsd: materialsUsd + formworkUsd + laborUsd + transportUsd + carbonCostUsd,
  };

  return {
    scenario,
    label: SCENARIO_LABELS[scenario],
    panelMassKg,
    totalMassKg: panelMassKg * inputs.panelCount,
    carbon,
    cost,
    costPerPanelUsd: cost.totalUsd / Math.max(inputs.panelCount, 1),
    truckLoads,
    recycledMaterialLoads,
    panelDeliveryKm,
    recycledMaterialKm,
    carbonSavingsVsSolidPct:
      solidCarbonTotal && solidCarbonTotal > 0
        ? ((solidCarbonTotal - carbon.totalKgCo2) / solidCarbonTotal) * 100
        : null,
    costDeltaVsSolidPct:
      solidCostTotal && solidCostTotal > 0
        ? ((cost.totalUsd - solidCostTotal) / solidCostTotal) * 100
        : null,
  };
}

export function runModel(inputs: ModelInputs): ModelOutputs {
  const normalized = normalizeModelInputs(inputs);
  const solidResult = evaluateScenario(normalized, "solid");
  const optimizedResult = evaluateScenario(
    normalized,
    "optimized",
    solidResult.carbon.totalKgCo2,
    solidResult.cost.totalUsd,
  );
  const kingStudResult = evaluateScenario(
    normalized,
    "kingStud",
    solidResult.carbon.totalKgCo2,
    solidResult.cost.totalUsd,
  );

  const comparison = [solidResult, optimizedResult, kingStudResult];
  const active =
    comparison.find((item) => item.scenario === normalized.scenario) ?? optimizedResult;

  return {
    active,
    comparison,
    panelCount: normalized.panelCount,
    transportKmTotal: active.panelDeliveryKm + active.recycledMaterialKm,
    truckLoads: active.truckLoads,
    transport: {
      panelDeliveryKm: active.panelDeliveryKm,
      recycledMaterialKm: active.recycledMaterialKm,
      panelDeliveryLoads: active.truckLoads,
      recycledMaterialLoads: active.recycledMaterialLoads,
    },
  };
}

export function getThesisValidationMetrics(inputs: ModelInputs): {
  massReductionPct: number;
  carbonReductionPct: number;
} {
  const normalized = normalizeModelInputs(inputs);
  const solidMass = SOLID_PANEL_MASS_KG;
  const optimizedMass = computePanelMassKg(
    "optimized",
    normalized.optimizationMassReduction,
  );
  const solid = evaluateScenario(normalized, "solid");
  const optimized = evaluateScenario(normalized, "optimized");

  return {
    massReductionPct: ((solidMass - optimizedMass) / solidMass) * 100,
    carbonReductionPct:
      ((solid.carbon.totalKgCo2 - optimized.carbon.totalKgCo2) /
        solid.carbon.totalKgCo2) *
      100,
  };
}
