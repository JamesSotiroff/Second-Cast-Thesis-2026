export type PanelScenario = "solid" | "optimized" | "kingStud";

export interface EmissionFactors {
  cementKgCo2PerKg: number;
  sandKgCo2PerKg: number;
  polymerKgCo2PerKg: number;
  foamAgentKgCo2PerKg: number;
  acceleratorKgCo2PerKg: number;
  virginAggregateKgCo2PerKg: number;
  recycledAggregateKgCo2PerKg: number;
  foamCreteKgCo2PerKg: number;
  truckingKgCo2PerKmPerLoad: number;
  manufacturingKgCo2PerKwh: number;
  manufacturingKwhPerPanel: number;
}

export interface UnitCosts {
  cementPerKg: number;
  sandPerKg: number;
  polymerPerKg: number;
  foamAgentPerKg: number;
  acceleratorPerKg: number;
  recycledRubblePerTonne: number;
  virginAggregatePerTonne: number;
  formworkPerPanel: number;
  laborPerPanel: number;
  truckingPerKm: number;
  truckingBasePerLoad: number;
}

export interface ModelInputs {
  panelCount: number;
  batchSize: number;
  transportKmOneWay: number;
  recycledMaterialTransportKmOneWay: number;
  recycledAggregateTruckCapacityKg: number;
  roundTrip: boolean;
  optimizationMassReduction: number;
  recycledAggregatePct: number;
  foamCreteFillRatio: number;
  scenario: PanelScenario;
  emissionFactors: EmissionFactors;
  unitCosts: UnitCosts;
  carbonPricePerTonne: number;
}

export interface MaterialBreakdown {
  cementKg: number;
  sandKg: number;
  polymerKg: number;
  foamAgentKg: number;
  acceleratorKg: number;
  recycledAggregateKg: number;
  virginAggregateKg: number;
  foamCreteKg: number;
}

export interface CarbonBreakdown {
  materialsKgCo2: number;
  manufacturingKgCo2: number;
  transportKgCo2: number;
  panelDeliveryKgCo2: number;
  recycledMaterialTransportKgCo2: number;
  totalKgCo2: number;
}

export interface CostBreakdown {
  materialsUsd: number;
  formworkUsd: number;
  laborUsd: number;
  transportUsd: number;
  panelDeliveryUsd: number;
  recycledMaterialTransportUsd: number;
  carbonCostUsd: number;
  totalUsd: number;
}

export interface ScenarioResult {
  scenario: PanelScenario;
  label: string;
  panelMassKg: number;
  totalMassKg: number;
  carbon: CarbonBreakdown;
  cost: CostBreakdown;
  costPerPanelUsd: number;
  truckLoads: number;
  recycledMaterialLoads: number;
  panelDeliveryKm: number;
  recycledMaterialKm: number;
  carbonSavingsVsSolidPct: number | null;
  costDeltaVsSolidPct: number | null;
}

export interface ModelOutputs {
  active: ScenarioResult;
  comparison: ScenarioResult[];
  panelCount: number;
  transportKmTotal: number;
  truckLoads: number;
  transport: {
    panelDeliveryKm: number;
    recycledMaterialKm: number;
    panelDeliveryLoads: number;
    recycledMaterialLoads: number;
  };
}
