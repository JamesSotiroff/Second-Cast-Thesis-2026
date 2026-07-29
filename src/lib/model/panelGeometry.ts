import type { PanelScenario } from "./types";

/** Panel dimensions from thesis Section 3: 4'-0" x 4'-0" x 4" */
export const PANEL_WIDTH_FT = 4;
export const PANEL_HEIGHT_FT = 4;
export const PANEL_THICKNESS_FT = 4 / 12;

export const PANEL_WIDTH_M = PANEL_WIDTH_FT * 0.3048;
export const PANEL_HEIGHT_M = PANEL_HEIGHT_FT * 0.3048;
export const PANEL_THICKNESS_M = PANEL_THICKNESS_FT * 0.3048;

export const PANEL_VOLUME_M3 =
  PANEL_WIDTH_M * PANEL_HEIGHT_M * PANEL_THICKNESS_M;

/** Reference panel masses from thesis Figures 7 & 8 */
export const OPTIMIZED_PANEL_MASS_KG = 156;
export const KING_STUD_PANEL_MASS_KG = 168;
export const THESIS_MASS_REDUCTION = 0.33;
export const THESIS_CARBON_REDUCTION = 0.3;
export const THESIS_BATCH_SIZE = 26;
export const THESIS_TRANSPORT_KM = 150;

/** Solid baseline derived from optimized mass and 33% reduction */
export const SOLID_PANEL_MASS_KG =
  OPTIMIZED_PANEL_MASS_KG / (1 - THESIS_MASS_REDUCTION);

export const SCENARIO_LABELS: Record<PanelScenario, string> = {
  solid: "Solid Concrete (Baseline)",
  optimized: "Optimized Composite",
  kingStud: "King-Stud Composite",
};

export function getReferencePanelMassKg(scenario: PanelScenario): number {
  switch (scenario) {
    case "solid":
      return SOLID_PANEL_MASS_KG;
    case "optimized":
      return OPTIMIZED_PANEL_MASS_KG;
    case "kingStud":
      return KING_STUD_PANEL_MASS_KG;
  }
}

export function computePanelMassKg(
  scenario: PanelScenario,
  optimizationMassReduction: number,
): number {
  const reference = getReferencePanelMassKg(scenario);

  if (scenario === "solid") {
    return reference;
  }

  if (scenario === "optimized") {
    const baseline = SOLID_PANEL_MASS_KG;
    return baseline * (1 - optimizationMassReduction);
  }

  // King-stud: interpolate between optimized at max reduction and solid at zero
  const optimizedAtThesis =
    SOLID_PANEL_MASS_KG * (1 - THESIS_MASS_REDUCTION);
  const t = optimizationMassReduction / THESIS_MASS_REDUCTION;
  return KING_STUD_PANEL_MASS_KG + (optimizedAtThesis - KING_STUD_PANEL_MASS_KG) * t;
}

export function getEffectiveFoamRatio(
  scenario: PanelScenario,
  foamCreteFillRatio: number,
): number {
  if (scenario === "solid") {
    return 0;
  }
  if (scenario === "kingStud") {
    return foamCreteFillRatio * 0.75;
  }
  return foamCreteFillRatio;
}

export function computeMaterialBreakdown(
  panelMassKg: number,
  recycledAggregatePct: number,
  foamCreteFillRatio: number,
  scenario: PanelScenario = "optimized",
): {
  cementKg: number;
  sandKg: number;
  polymerKg: number;
  foamAgentKg: number;
  acceleratorKg: number;
  recycledAggregateKg: number;
  virginAggregateKg: number;
  foamCreteKg: number;
} {
  const effectiveFoam = getEffectiveFoamRatio(scenario, foamCreteFillRatio);
  const clampedFoam = Math.min(Math.max(effectiveFoam, 0), 0.85);
  const foamCreteKg = panelMassKg * clampedFoam * 0.35;
  const structuralMassKg = panelMassKg - foamCreteKg;

  const cementKg = structuralMassKg * 0.22;
  const sandKg = structuralMassKg * 0.38;
  const polymerKg = structuralMassKg * 0.015;
  const acceleratorKg = structuralMassKg * 0.002;
  const aggregateKg = structuralMassKg * 0.383;

  const recycledAggregateKg = aggregateKg * recycledAggregatePct;
  const virginAggregateKg = aggregateKg * (1 - recycledAggregatePct);
  const foamAgentKg = foamCreteKg * 0.04;

  return {
    cementKg,
    sandKg,
    polymerKg,
    foamAgentKg,
    acceleratorKg,
    recycledAggregateKg,
    virginAggregateKg,
    foamCreteKg,
  };
}
