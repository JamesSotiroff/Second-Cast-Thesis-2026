import {
  computeMaterialBreakdown,
  computePanelMassKg,
  SCENARIO_LABELS,
  SOLID_PANEL_MASS_KG,
} from "./panelGeometry";
import {
  computeTransportKm,
  computeTruckLoads,
} from "./transport";
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
    materials.sandKg * 0.005 +
    materials.polymerKg * 2.5 +
    materials.foamAgentKg * 1.2 +
    materials.acceleratorKg * 1.5
  );
}

function computeMaterialCost(
  materials: MaterialBreakdown,
  costs: ModelInputs["unitCosts"],
): number {
  return (
    materials.cementKg * costs.cementPerKg +
    materials.sandKg * costs.sandPerKg +
    materials.polymerKg * costs.polymerPerKg +
    materials.foamAgentKg * costs.foamAgentPerKg +
    materials.acceleratorKg * costs.acceleratorPerKg +
    (materials.recycledAggregateKg / 1000) * costs.recycledRubblePerTonne
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
  const transportKm = computeTransportKm(
    inputs.transportKmOneWay,
    inputs.roundTrip,
    truckLoads,
  );

  const materialsKgCo2 = computeMaterialCarbon(materials, inputs.emissionFactors);
  const manufacturingKgCo2 =
    inputs.emissionFactors.manufacturingKwhPerPanel *
    inputs.emissionFactors.manufacturingKgCo2PerKwh *
    inputs.panelCount;
  const transportKgCo2 =
    transportKm * inputs.emissionFactors.truckingKgCo2PerKmPerLoad;

  const carbon: CarbonBreakdown = {
    materialsKgCo2: materialsKgCo2 * inputs.panelCount,
    manufacturingKgCo2,
    transportKgCo2,
    totalKgCo2:
      materialsKgCo2 * inputs.panelCount + manufacturingKgCo2 + transportKgCo2,
  };

  const materialsUsd = computeMaterialCost(materials, inputs.unitCosts) * inputs.panelCount;
  const formworkUsd = inputs.unitCosts.formworkPerPanel * inputs.panelCount;
  const laborUsd = inputs.unitCosts.laborPerPanel * inputs.panelCount;
  const transportUsd =
    transportKm * inputs.unitCosts.truckingPerKm +
    truckLoads * inputs.unitCosts.truckingBasePerLoad;
  const carbonCostUsd =
    (carbon.totalKgCo2 / 1000) * inputs.carbonPricePerTonne;

  const cost: CostBreakdown = {
    materialsUsd,
    formworkUsd,
    laborUsd,
    transportUsd,
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
  const solidResult = evaluateScenario(inputs, "solid");
  const optimizedResult = evaluateScenario(
    inputs,
    "optimized",
    solidResult.carbon.totalKgCo2,
    solidResult.cost.totalUsd,
  );
  const kingStudResult = evaluateScenario(
    inputs,
    "kingStud",
    solidResult.carbon.totalKgCo2,
    solidResult.cost.totalUsd,
  );

  const comparison = [solidResult, optimizedResult, kingStudResult];
  const active =
    comparison.find((item) => item.scenario === inputs.scenario) ?? optimizedResult;

  const truckLoads = computeTruckLoads(inputs.panelCount, inputs.batchSize);
  const transportKmTotal = computeTransportKm(
    inputs.transportKmOneWay,
    inputs.roundTrip,
    truckLoads,
  );

  return {
    active,
    comparison,
    panelCount: inputs.panelCount,
    transportKmTotal,
    truckLoads,
  };
}

export function getThesisValidationMetrics(inputs: ModelInputs): {
  massReductionPct: number;
  carbonReductionPct: number;
} {
  const solidMass = SOLID_PANEL_MASS_KG;
  const optimizedMass = computePanelMassKg("optimized", inputs.optimizationMassReduction);
  const solid = evaluateScenario(inputs, "solid");
  const optimized = evaluateScenario(inputs, "optimized");

  return {
    massReductionPct: ((solidMass - optimizedMass) / solidMass) * 100,
    carbonReductionPct:
      ((solid.carbon.totalKgCo2 - optimized.carbon.totalKgCo2) /
        solid.carbon.totalKgCo2) *
      100,
  };
}
