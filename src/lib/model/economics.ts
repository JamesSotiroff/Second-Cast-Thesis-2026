import type { MaterialBreakdown, UnitCosts } from "./types";

export function computeMaterialCost(
  materials: MaterialBreakdown,
  costs: UnitCosts,
): number {
  return (
    materials.cementKg * costs.cementPerKg +
    materials.sandKg * costs.sandPerKg +
    materials.polymerKg * costs.polymerPerKg +
    materials.foamAgentKg * costs.foamAgentPerKg +
    materials.acceleratorKg * costs.acceleratorPerKg +
    (materials.recycledAggregateKg / 1000) * costs.recycledRubblePerTonne +
    (materials.virginAggregateKg / 1000) * costs.virginAggregatePerTonne
  );
}

export function computeCarbonCost(
  totalKgCo2: number,
  carbonPricePerTonne: number,
): number {
  return (totalKgCo2 / 1000) * carbonPricePerTonne;
}
