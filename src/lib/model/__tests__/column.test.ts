import { describe, expect, it } from "vitest";

import {
  compareColumnToReference,
  evaluateExperimentalColumn,
} from "../modules/column";

const material = [{ id: "reference-material", densityKgPerM3: 2_400, volumeFraction: 1 }];

describe("experimental column model", () => {
  it("evaluates a rectangular cross-section and transport aggregation", () => {
    const result = evaluateExperimentalColumn({
      heightM: 3,
      crossSection: { shape: "rectangular", widthM: 0.4, depthM: 0.5 },
      voidFraction: 0,
      unitCount: 4,
      materials: material,
      transportPayloadCapacityKg: 2_000,
    });

    expect(result.validation.maturity).toBe("experimental");
    expect(result.validation.validationStatus).toBe("provisional");
    expect(result.geometry.crossSectionAreaM2).toBeCloseTo(0.2);
    expect(result.geometry.netVolumeM3).toBeCloseTo(0.6);
    expect(result.materials.unitMassKg).toBeCloseTo(1_440);
    expect(result.transport.totalMassKg).toBeCloseTo(5_760);
    expect(result.transport.estimatedLoads).toBe(3);
  });

  it("evaluates a circular cross-section", () => {
    const result = evaluateExperimentalColumn({
      heightM: 2,
      crossSection: { shape: "circular", diameterM: 1 },
      voidFraction: 0.2,
      unitCount: 1,
      materials: material,
    });

    expect(result.geometry.crossSectionAreaM2).toBeCloseTo(Math.PI / 4);
    expect(result.geometry.netVolumeM3).toBeCloseTo((Math.PI / 2) * 0.8);
    expect(result.transport.estimatedLoads).toBeNull();
  });

  it("compares against a caller-supplied reference output", () => {
    const reference = evaluateExperimentalColumn({
      heightM: 2,
      crossSection: { shape: "rectangular", widthM: 1, depthM: 1 },
      voidFraction: 0,
      unitCount: 1,
      materials: material,
    });
    const candidate = evaluateExperimentalColumn({
      heightM: 1,
      crossSection: { shape: "rectangular", widthM: 1, depthM: 1 },
      voidFraction: 0,
      unitCount: 1,
      materials: material,
    });

    const comparison = compareColumnToReference(
      candidate,
      reference,
      "reference-output",
    );

    expect(comparison.deltas.netVolumeM3).toBeCloseTo(-1);
    expect(comparison.percentChanges.totalTransportMassPct).toBeCloseTo(-50);
    expect(comparison.interpretation).toBe("arithmetic-comparison-only");
  });

  it.each([
    ["negative height", { heightM: -1 }],
    ["non-finite void", { voidFraction: Number.NaN }],
    ["void fraction above one", { voidFraction: 1.1 }],
    ["non-integer count", { unitCount: 1.25 }],
    ["bad material density", {
      materials: [{ id: "material", densityKgPerM3: -1, volumeFraction: 1 }],
    }],
    ["fraction sum mismatch", {
      materials: [{ id: "material", densityKgPerM3: 2_000, volumeFraction: 0.5 }],
    }],
  ])("rejects %s", (_label, override) => {
    expect(() =>
      evaluateExperimentalColumn({
        heightM: 3,
        crossSection: { shape: "rectangular", widthM: 0.4, depthM: 0.4 },
        voidFraction: 0,
        unitCount: 1,
        materials: material,
        ...override,
      }),
    ).toThrow(RangeError);
  });

  it("rejects invalid dimensions for both cross-section variants", () => {
    expect(() =>
      evaluateExperimentalColumn({
        heightM: 3,
        crossSection: { shape: "rectangular", widthM: -0.4, depthM: 0.4 },
        voidFraction: 0,
        unitCount: 1,
        materials: material,
      }),
    ).toThrow(RangeError);

    expect(() =>
      evaluateExperimentalColumn({
        heightM: 3,
        crossSection: { shape: "circular", diameterM: Number.POSITIVE_INFINITY },
        voidFraction: 0,
        unitCount: 1,
        materials: material,
      }),
    ).toThrow(RangeError);
  });
});
