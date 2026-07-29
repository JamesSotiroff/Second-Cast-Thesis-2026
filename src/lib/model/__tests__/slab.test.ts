import { describe, expect, it } from "vitest";

import {
  compareSlabToReference,
  evaluateExperimentalSlab,
} from "../modules/slab";

const material = [{ id: "reference-material", densityKgPerM3: 2_000, volumeFraction: 1 }];

describe("experimental slab model", () => {
  it("returns geometry, material, transport, and provisional metadata", () => {
    const result = evaluateExperimentalSlab({
      lengthM: 4,
      widthM: 2,
      thicknessM: 0.25,
      voidFraction: 0.1,
      unitCount: 3,
      materials: material,
      transportPayloadCapacityKg: 5_000,
    });

    expect(result.validation.maturity).toBe("experimental");
    expect(result.validation.validationStatus).toBe("provisional");
    expect(result.geometry.grossVolumeM3).toBeCloseTo(2);
    expect(result.geometry.netVolumeM3).toBeCloseTo(1.8);
    expect(result.materials.unitMassKg).toBeCloseTo(3_600);
    expect(result.transport.totalMassKg).toBeCloseTo(10_800);
    expect(result.transport.estimatedLoads).toBe(3);
  });

  it("computes caller-labelled reference deltas without performance claims", () => {
    const reference = evaluateExperimentalSlab({
      lengthM: 2,
      widthM: 2,
      thicknessM: 0.25,
      voidFraction: 0,
      unitCount: 2,
      materials: material,
    });
    const candidate = evaluateExperimentalSlab({
      lengthM: 2,
      widthM: 2,
      thicknessM: 0.25,
      voidFraction: 0.5,
      unitCount: 2,
      materials: material,
    });

    const comparison = compareSlabToReference(
      candidate,
      reference,
      "caller-baseline",
    );

    expect(comparison.referenceId).toBe("caller-baseline");
    expect(comparison.deltas.unitMassKg).toBeCloseTo(-1_000);
    expect(comparison.percentChanges.unitMassPct).toBeCloseTo(-50);
    expect(comparison.interpretation).toBe("arithmetic-comparison-only");
  });

  it.each([
    ["negative dimension", { lengthM: -1 }],
    ["non-finite dimension", { widthM: Number.POSITIVE_INFINITY }],
    ["void fraction above one", { voidFraction: 1.01 }],
    ["fraction sum mismatch", {
      materials: [{ id: "material", densityKgPerM3: 2_000, volumeFraction: 0.8 }],
    }],
    ["non-integer count", { unitCount: 1.5 }],
    ["zero payload capacity", { transportPayloadCapacityKg: 0 }],
  ])("rejects %s", (_label, override) => {
    expect(() =>
      evaluateExperimentalSlab({
        lengthM: 2,
        widthM: 2,
        thicknessM: 0.2,
        voidFraction: 0,
        unitCount: 1,
        materials: material,
        ...override,
      }),
    ).toThrow(RangeError);
  });

  it("uses null percentages when a reference metric is zero", () => {
    const zero = evaluateExperimentalSlab({
      lengthM: 0,
      widthM: 2,
      thicknessM: 0.2,
      voidFraction: 0,
      unitCount: 1,
      materials: material,
    });

    expect(
      compareSlabToReference(zero, zero, "zero-reference").percentChanges
        .unitMassPct,
    ).toBeNull();
  });
});
