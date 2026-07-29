import { describe, expect, it } from "vitest";
import { createDefaultInputs } from "@/data/midwest/defaults";
import { computeMaterialCost } from "../economics";
import {
  computeMaterialBreakdown,
  computePanelMassKg,
  KING_STUD_PANEL_MASS_KG,
  SOLID_PANEL_MASS_KG,
  THESIS_MASS_REDUCTION,
} from "../panelGeometry";
import { getThesisValidationMetrics, runModel } from "../embodiedCarbon";
import { computeTransportKm, computeTruckLoads } from "../transport";
import { normalizeModelInputs } from "../validation";

describe("wall-panel geometry", () => {
  it("matches thesis reference masses at the default reduction", () => {
    expect(computePanelMassKg("optimized", THESIS_MASS_REDUCTION)).toBeCloseTo(156);
    expect(computePanelMassKg("kingStud", THESIS_MASS_REDUCTION)).toBeCloseTo(
      KING_STUD_PANEL_MASS_KG,
    );
  });

  it("interpolates king-stud mass from the solid baseline", () => {
    expect(computePanelMassKg("kingStud", 0)).toBeCloseTo(SOLID_PANEL_MASS_KG);
  });

  it("preserves panel mass across material constituents", () => {
    const panelMass = 156;
    const materials = computeMaterialBreakdown(panelMass, 1, 0.45, "optimized");
    const total =
      materials.cementKg +
      materials.sandKg +
      materials.polymerKg +
      materials.acceleratorKg +
      materials.recycledAggregateKg +
      materials.virginAggregateKg +
      materials.foamCreteKg;

    expect(total).toBeCloseTo(panelMass);
  });
});

describe("transport and economics", () => {
  it("rounds partial batches up to full loads", () => {
    expect(computeTruckLoads(27, 26)).toBe(2);
    expect(computeTransportKm(150, true, 2)).toBe(600);
  });

  it("charges for both recycled and virgin aggregate", () => {
    const inputs = createDefaultInputs();
    const materials = computeMaterialBreakdown(156, 0.5, 0.45, "optimized");
    const withAggregateCosts = computeMaterialCost(materials, inputs.unitCosts);
    const withoutAggregateCosts = computeMaterialCost(materials, {
      ...inputs.unitCosts,
      recycledRubblePerTonne: 0,
      virginAggregatePerTonne: 0,
    });

    expect(withAggregateCosts).toBeGreaterThan(withoutAggregateCosts);
  });
});

describe("model validation and regression", () => {
  it("normalizes invalid external inputs", () => {
    const normalized = normalizeModelInputs(
      createDefaultInputs({
        panelCount: -1,
        batchSize: 0,
        recycledAggregatePct: 3,
      }),
    );

    expect(normalized.panelCount).toBe(0);
    expect(normalized.batchSize).toBe(1);
    expect(normalized.recycledAggregatePct).toBe(1);
  });

  it("reproduces the thesis headline targets at defaults", () => {
    const inputs = createDefaultInputs();
    const validation = getThesisValidationMetrics(inputs);
    const outputs = runModel(inputs);

    expect(validation.massReductionPct).toBeCloseTo(33);
    expect(validation.carbonReductionPct).toBeGreaterThan(25);
    expect(validation.carbonReductionPct).toBeLessThan(35);
    expect(outputs.transport.recycledMaterialLoads).toBeGreaterThan(0);
    expect(outputs.comparison.find(({ scenario }) => scenario === "kingStud")?.panelMassKg)
      .toBeCloseTo(168);
  });
});
