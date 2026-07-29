import { describe, expect, it } from "vitest";

import { calculateCircularityImpacts } from "../modules/circularity";

const validInputs = {
  materialMassKg: 100,
  serviceLifeYears: 30,
  replacementCycles: 2,
  recoveryRate: 0.8,
  reuseRate: 0.25,
  recycledVirginDisplacementRate: 0.5,
  virginMaterialImpactKgCo2PerKg: 2,
  endOfLife: {
    disposalImpactKgCo2PerKg: 0.1,
    recoveryProcessingImpactKgCo2PerKg: 0.05,
    reuseProcessingImpactKgCo2PerKg: 0.1,
  },
};

describe("experimental circularity calculations", () => {
  it("separates lifecycle material flows and impact boundaries", () => {
    const result = calculateCircularityImpacts(validInputs);

    expect(result.metadata.status).toBe("experimental");
    expect(result.metadata.maturity).toBe("provisional");
    expect(result.lifecycleBoundary).toEqual({
      serviceLifeYears: 30,
      replacementCycles: 2,
      lifecycleInstances: 3,
    });
    expect(result.materialFlowBoundary).toEqual({
      totalMaterialThroughputKg: 300,
      recoveredMaterialKg: 240,
      reusedMaterialKg: 60,
      recycledMaterialKg: 180,
      disposedMaterialKg: 60,
    });
    expect(result.avoidedVirginBoundary.avoidedVirginMaterialKg).toBe(150);
    expect(result.avoidedVirginBoundary.avoidedVirginImpactKgCo2).toBe(300);
    expect(result.endOfLifeBoundary.linearDisposalImpactKgCo2).toBe(30);
    expect(
      result.endOfLifeBoundary.circularEndOfLifeImpactKgCo2,
    ).toBeCloseTo(24);
    expect(
      result.endOfLifeBoundary.avoidedEndOfLifeImpactKgCo2,
    ).toBeCloseTo(6);
    expect(result.wholeLifeBoundary.totalAvoidedImpactKgCo2).toBeCloseTo(306);
  });

  it("allows zero recovery without creating material credits", () => {
    const result = calculateCircularityImpacts({
      ...validInputs,
      replacementCycles: 0,
      recoveryRate: 0,
    });

    expect(result.materialFlowBoundary.recoveredMaterialKg).toBe(0);
    expect(result.materialFlowBoundary.disposedMaterialKg).toBe(100);
    expect(result.avoidedVirginBoundary.avoidedVirginMaterialKg).toBe(0);
    expect(result.endOfLifeBoundary.avoidedEndOfLifeImpactKgCo2).toBe(0);
    expect(result.wholeLifeBoundary.totalAvoidedImpactKgCo2).toBe(0);
  });

  it("validates finite, nonnegative, integer, and rate inputs", () => {
    expect(() =>
      calculateCircularityImpacts({
        ...validInputs,
        materialMassKg: Number.POSITIVE_INFINITY,
      }),
    ).toThrow(RangeError);

    expect(() =>
      calculateCircularityImpacts({
        ...validInputs,
        replacementCycles: 1.5,
      }),
    ).toThrow(/integer/);

    expect(() =>
      calculateCircularityImpacts({
        ...validInputs,
        reuseRate: 1.01,
      }),
    ).toThrow(/\[0, 1\]/);
  });
});
