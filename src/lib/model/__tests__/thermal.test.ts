import { describe, expect, it } from "vitest";

import {
  calculateThermalOperationalImpacts,
  thermalPropertyToUValue,
} from "../modules/thermal";

describe("experimental thermal calculations", () => {
  it("calculates degree-day operational savings and embodied break-even", () => {
    const result = calculateThermalOperationalImpacts({
      assembly: {
        areaM2: 100,
        baseline: { uValueWPerM2K: 0.5 },
        proposed: { rValueM2KPerW: 4 },
      },
      energy: {
        approach: "degreeDays",
        heatingDegreeDaysC: 2_000,
        coolingDegreeDaysC: 500,
        heatingSystemEfficiency: 0.8,
        coolingSystemCop: 4,
        heatingEmissionFactorKgCo2PerKwh: 0.2,
        coolingEmissionFactorKgCo2PerKwh: 0.4,
      },
      serviceLifeYears: 10,
      incrementalEmbodiedKgCo2: 660,
    });

    expect(result.metadata.status).toBe("experimental");
    expect(result.metadata.maturity).toBe("provisional");
    expect(result.thermalBoundary.proposedUValueWPerM2K).toBeCloseTo(0.25);
    expect(result.operationalBoundary.annualHeatingEnergyDeltaKwh).toBeCloseTo(
      1_500,
    );
    expect(result.operationalBoundary.annualCoolingEnergyDeltaKwh).toBeCloseTo(
      75,
    );
    expect(result.operationalBoundary.annualEmissionsAvoidedKgCo2).toBeCloseTo(
      330,
    );
    expect(result.breakEven.years).toBeCloseTo(2);
    expect(result.breakEven.occursWithinServiceLife).toBe(true);
    expect(result.wholeLifeBoundary.netEmissionsAvoidedKgCo2).toBeCloseTo(
      2_640,
    );
  });

  it("supports a supplied annual energy delta", () => {
    const result = calculateThermalOperationalImpacts({
      assembly: {
        areaM2: 25,
        baseline: { rValueM2KPerW: 2 },
        proposed: { uValueWPerM2K: 0.2 },
      },
      energy: {
        approach: "annualEnergyDelta",
        annualEnergyDeltaKwh: 1_000,
        energyEmissionFactorKgCo2PerKwh: 0.25,
      },
      serviceLifeYears: 20,
      incrementalEmbodiedKgCo2: 500,
    });

    expect(result.operationalBoundary.approach).toBe("annualEnergyDelta");
    expect(result.operationalBoundary.annualEnergyDeltaKwh).toBe(1_000);
    expect(result.operationalBoundary.lifetimeEmissionsAvoidedKgCo2).toBe(5_000);
    expect(result.breakEven.years).toBe(2);
  });

  it("returns no break-even when annual emissions are not avoided", () => {
    const result = calculateThermalOperationalImpacts({
      assembly: {
        areaM2: 10,
        baseline: { uValueWPerM2K: 0.2 },
        proposed: { uValueWPerM2K: 0.4 },
      },
      energy: {
        approach: "degreeDays",
        heatingDegreeDaysC: 1_000,
        coolingDegreeDaysC: 0,
        heatingSystemEfficiency: 1,
        coolingSystemCop: 3,
        heatingEmissionFactorKgCo2PerKwh: 0.2,
        coolingEmissionFactorKgCo2PerKwh: 0.2,
      },
      serviceLifeYears: 10,
      incrementalEmbodiedKgCo2: 100,
    });

    expect(result.operationalBoundary.annualEmissionsAvoidedKgCo2).toBeLessThan(
      0,
    );
    expect(result.breakEven).toEqual({
      years: null,
      occursWithinServiceLife: false,
    });
  });

  it("validates finite, nonnegative, and range-constrained inputs", () => {
    expect(() => thermalPropertyToUValue({ rValueM2KPerW: 0 })).toThrow(
      RangeError,
    );

    expect(() =>
      calculateThermalOperationalImpacts({
        assembly: {
          areaM2: Number.NaN,
          baseline: { uValueWPerM2K: 0.5 },
          proposed: { uValueWPerM2K: 0.25 },
        },
        energy: {
          approach: "degreeDays",
          heatingDegreeDaysC: 1_000,
          coolingDegreeDaysC: 0,
          heatingSystemEfficiency: 1.1,
          coolingSystemCop: 3,
          heatingEmissionFactorKgCo2PerKwh: 0.2,
          coolingEmissionFactorKgCo2PerKwh: 0.2,
        },
        serviceLifeYears: 10,
        incrementalEmbodiedKgCo2: 100,
      }),
    ).toThrow(RangeError);
  });
});
