export const THERMAL_MODULE_METADATA = {
  status: "experimental",
  maturity: "provisional",
  version: "0.1.0",
  boundary:
    "Comparative envelope heat-transfer savings, operational energy emissions, and incremental embodied emissions only.",
} as const;

export type ThermalProperty =
  | { uValueWPerM2K: number; rValueM2KPerW?: never }
  | { uValueWPerM2K?: never; rValueM2KPerW: number };

export interface ThermalAssemblyComparison {
  areaM2: number;
  baseline: ThermalProperty;
  proposed: ThermalProperty;
}

export interface DegreeDayEnergyApproach {
  approach: "degreeDays";
  heatingDegreeDaysC: number;
  coolingDegreeDaysC: number;
  heatingSystemEfficiency: number;
  coolingSystemCop: number;
  heatingEmissionFactorKgCo2PerKwh: number;
  coolingEmissionFactorKgCo2PerKwh: number;
}

export interface AnnualEnergyDeltaApproach {
  approach: "annualEnergyDelta";
  annualEnergyDeltaKwh: number;
  energyEmissionFactorKgCo2PerKwh: number;
}

export interface ThermalCalculationInputs {
  assembly: ThermalAssemblyComparison;
  energy: DegreeDayEnergyApproach | AnnualEnergyDeltaApproach;
  serviceLifeYears: number;
  incrementalEmbodiedKgCo2: number;
}

export interface ThermalCalculationOutputs {
  metadata: typeof THERMAL_MODULE_METADATA;
  thermalBoundary: {
    baselineUValueWPerM2K: number;
    proposedUValueWPerM2K: number;
    uValueReductionWPerM2K: number;
  };
  operationalBoundary: {
    approach: DegreeDayEnergyApproach["approach"] | AnnualEnergyDeltaApproach["approach"];
    annualHeatingEnergyDeltaKwh: number;
    annualCoolingEnergyDeltaKwh: number;
    annualEnergyDeltaKwh: number;
    annualEmissionsAvoidedKgCo2: number;
    lifetimeEmissionsAvoidedKgCo2: number;
  };
  embodiedBoundary: {
    incrementalEmbodiedKgCo2: number;
  };
  wholeLifeBoundary: {
    serviceLifeYears: number;
    netEmissionsAvoidedKgCo2: number;
  };
  breakEven: {
    years: number | null;
    occursWithinServiceLife: boolean;
  };
}

function requireFiniteNonnegative(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be finite and nonnegative`);
  }
}

function requireFinitePositive(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be finite and greater than zero`);
  }
}

function requireRateAboveZero(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0 || value > 1) {
    throw new RangeError(`${name} must be in the range (0, 1]`);
  }
}

export function thermalPropertyToUValue(property: ThermalProperty): number {
  if (property.uValueWPerM2K !== undefined) {
    requireFinitePositive(property.uValueWPerM2K, "uValueWPerM2K");
    return property.uValueWPerM2K;
  }

  requireFinitePositive(property.rValueM2KPerW, "rValueM2KPerW");
  return 1 / property.rValueM2KPerW;
}

export function calculateThermalOperationalImpacts(
  inputs: ThermalCalculationInputs,
): ThermalCalculationOutputs {
  requireFiniteNonnegative(inputs.assembly.areaM2, "assembly.areaM2");
  requireFinitePositive(inputs.serviceLifeYears, "serviceLifeYears");
  requireFiniteNonnegative(
    inputs.incrementalEmbodiedKgCo2,
    "incrementalEmbodiedKgCo2",
  );

  const baselineUValue = thermalPropertyToUValue(inputs.assembly.baseline);
  const proposedUValue = thermalPropertyToUValue(inputs.assembly.proposed);
  const uValueReduction = baselineUValue - proposedUValue;

  let annualHeatingEnergyDeltaKwh = 0;
  let annualCoolingEnergyDeltaKwh = 0;
  let annualEmissionsAvoidedKgCo2 = 0;

  if (inputs.energy.approach === "degreeDays") {
    requireFiniteNonnegative(
      inputs.energy.heatingDegreeDaysC,
      "energy.heatingDegreeDaysC",
    );
    requireFiniteNonnegative(
      inputs.energy.coolingDegreeDaysC,
      "energy.coolingDegreeDaysC",
    );
    requireRateAboveZero(
      inputs.energy.heatingSystemEfficiency,
      "energy.heatingSystemEfficiency",
    );
    requireFinitePositive(inputs.energy.coolingSystemCop, "energy.coolingSystemCop");
    requireFiniteNonnegative(
      inputs.energy.heatingEmissionFactorKgCo2PerKwh,
      "energy.heatingEmissionFactorKgCo2PerKwh",
    );
    requireFiniteNonnegative(
      inputs.energy.coolingEmissionFactorKgCo2PerKwh,
      "energy.coolingEmissionFactorKgCo2PerKwh",
    );

    const envelopeEnergyCoefficient =
      (uValueReduction * inputs.assembly.areaM2 * 24) / 1000;
    annualHeatingEnergyDeltaKwh =
      (envelopeEnergyCoefficient * inputs.energy.heatingDegreeDaysC) /
      inputs.energy.heatingSystemEfficiency;
    annualCoolingEnergyDeltaKwh =
      (envelopeEnergyCoefficient * inputs.energy.coolingDegreeDaysC) /
      inputs.energy.coolingSystemCop;
    annualEmissionsAvoidedKgCo2 =
      annualHeatingEnergyDeltaKwh *
        inputs.energy.heatingEmissionFactorKgCo2PerKwh +
      annualCoolingEnergyDeltaKwh *
        inputs.energy.coolingEmissionFactorKgCo2PerKwh;
  } else {
    requireFiniteNonnegative(
      inputs.energy.annualEnergyDeltaKwh,
      "energy.annualEnergyDeltaKwh",
    );
    requireFiniteNonnegative(
      inputs.energy.energyEmissionFactorKgCo2PerKwh,
      "energy.energyEmissionFactorKgCo2PerKwh",
    );
    annualHeatingEnergyDeltaKwh = inputs.energy.annualEnergyDeltaKwh;
    annualEmissionsAvoidedKgCo2 =
      inputs.energy.annualEnergyDeltaKwh *
      inputs.energy.energyEmissionFactorKgCo2PerKwh;
  }

  const annualEnergyDeltaKwh =
    annualHeatingEnergyDeltaKwh + annualCoolingEnergyDeltaKwh;
  const lifetimeEmissionsAvoidedKgCo2 =
    annualEmissionsAvoidedKgCo2 * inputs.serviceLifeYears;
  const breakEvenYears =
    annualEmissionsAvoidedKgCo2 > 0
      ? inputs.incrementalEmbodiedKgCo2 / annualEmissionsAvoidedKgCo2
      : null;

  return {
    metadata: THERMAL_MODULE_METADATA,
    thermalBoundary: {
      baselineUValueWPerM2K: baselineUValue,
      proposedUValueWPerM2K: proposedUValue,
      uValueReductionWPerM2K: uValueReduction,
    },
    operationalBoundary: {
      approach: inputs.energy.approach,
      annualHeatingEnergyDeltaKwh,
      annualCoolingEnergyDeltaKwh,
      annualEnergyDeltaKwh,
      annualEmissionsAvoidedKgCo2,
      lifetimeEmissionsAvoidedKgCo2,
    },
    embodiedBoundary: {
      incrementalEmbodiedKgCo2: inputs.incrementalEmbodiedKgCo2,
    },
    wholeLifeBoundary: {
      serviceLifeYears: inputs.serviceLifeYears,
      netEmissionsAvoidedKgCo2:
        lifetimeEmissionsAvoidedKgCo2 - inputs.incrementalEmbodiedKgCo2,
    },
    breakEven: {
      years: breakEvenYears,
      occursWithinServiceLife:
        breakEvenYears !== null && breakEvenYears <= inputs.serviceLifeYears,
    },
  };
}
