export const CIRCULARITY_MODULE_METADATA = {
  status: "experimental",
  maturity: "provisional",
  version: "0.1.0",
  boundary:
    "Comparative material recovery, avoided virgin production, and end-of-life processing impacts only.",
} as const;

export interface CircularityCalculationInputs {
  materialMassKg: number;
  serviceLifeYears: number;
  replacementCycles: number;
  recoveryRate: number;
  reuseRate: number;
  recycledVirginDisplacementRate: number;
  virginMaterialImpactKgCo2PerKg: number;
  endOfLife: {
    disposalImpactKgCo2PerKg: number;
    recoveryProcessingImpactKgCo2PerKg: number;
    reuseProcessingImpactKgCo2PerKg: number;
  };
}

export interface CircularityCalculationOutputs {
  metadata: typeof CIRCULARITY_MODULE_METADATA;
  lifecycleBoundary: {
    serviceLifeYears: number;
    replacementCycles: number;
    lifecycleInstances: number;
  };
  materialFlowBoundary: {
    totalMaterialThroughputKg: number;
    recoveredMaterialKg: number;
    reusedMaterialKg: number;
    recycledMaterialKg: number;
    disposedMaterialKg: number;
  };
  avoidedVirginBoundary: {
    avoidedVirginMaterialKg: number;
    avoidedVirginImpactKgCo2: number;
  };
  endOfLifeBoundary: {
    linearDisposalImpactKgCo2: number;
    recoveryProcessingImpactKgCo2: number;
    reuseProcessingImpactKgCo2: number;
    residualDisposalImpactKgCo2: number;
    circularEndOfLifeImpactKgCo2: number;
    avoidedEndOfLifeImpactKgCo2: number;
  };
  wholeLifeBoundary: {
    totalAvoidedImpactKgCo2: number;
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

function requireUnitRange(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be in the range [0, 1]`);
  }
}

export function calculateCircularityImpacts(
  inputs: CircularityCalculationInputs,
): CircularityCalculationOutputs {
  requireFiniteNonnegative(inputs.materialMassKg, "materialMassKg");
  requireFinitePositive(inputs.serviceLifeYears, "serviceLifeYears");
  requireFiniteNonnegative(inputs.replacementCycles, "replacementCycles");
  if (!Number.isInteger(inputs.replacementCycles)) {
    throw new RangeError("replacementCycles must be an integer");
  }

  requireUnitRange(inputs.recoveryRate, "recoveryRate");
  requireUnitRange(inputs.reuseRate, "reuseRate");
  requireUnitRange(
    inputs.recycledVirginDisplacementRate,
    "recycledVirginDisplacementRate",
  );
  requireFiniteNonnegative(
    inputs.virginMaterialImpactKgCo2PerKg,
    "virginMaterialImpactKgCo2PerKg",
  );
  requireFiniteNonnegative(
    inputs.endOfLife.disposalImpactKgCo2PerKg,
    "endOfLife.disposalImpactKgCo2PerKg",
  );
  requireFiniteNonnegative(
    inputs.endOfLife.recoveryProcessingImpactKgCo2PerKg,
    "endOfLife.recoveryProcessingImpactKgCo2PerKg",
  );
  requireFiniteNonnegative(
    inputs.endOfLife.reuseProcessingImpactKgCo2PerKg,
    "endOfLife.reuseProcessingImpactKgCo2PerKg",
  );

  const lifecycleInstances = inputs.replacementCycles + 1;
  const totalMaterialThroughputKg = inputs.materialMassKg * lifecycleInstances;
  const recoveredMaterialKg = totalMaterialThroughputKg * inputs.recoveryRate;
  const reusedMaterialKg = recoveredMaterialKg * inputs.reuseRate;
  const recycledMaterialKg = recoveredMaterialKg - reusedMaterialKg;
  const disposedMaterialKg = totalMaterialThroughputKg - recoveredMaterialKg;
  const avoidedVirginMaterialKg =
    reusedMaterialKg +
    recycledMaterialKg * inputs.recycledVirginDisplacementRate;

  const avoidedVirginImpactKgCo2 =
    avoidedVirginMaterialKg * inputs.virginMaterialImpactKgCo2PerKg;
  const linearDisposalImpactKgCo2 =
    totalMaterialThroughputKg *
    inputs.endOfLife.disposalImpactKgCo2PerKg;
  const recoveryProcessingImpactKgCo2 =
    recoveredMaterialKg *
    inputs.endOfLife.recoveryProcessingImpactKgCo2PerKg;
  const reuseProcessingImpactKgCo2 =
    reusedMaterialKg * inputs.endOfLife.reuseProcessingImpactKgCo2PerKg;
  const residualDisposalImpactKgCo2 =
    disposedMaterialKg * inputs.endOfLife.disposalImpactKgCo2PerKg;
  const circularEndOfLifeImpactKgCo2 =
    recoveryProcessingImpactKgCo2 +
    reuseProcessingImpactKgCo2 +
    residualDisposalImpactKgCo2;
  const avoidedEndOfLifeImpactKgCo2 =
    linearDisposalImpactKgCo2 - circularEndOfLifeImpactKgCo2;

  return {
    metadata: CIRCULARITY_MODULE_METADATA,
    lifecycleBoundary: {
      serviceLifeYears: inputs.serviceLifeYears,
      replacementCycles: inputs.replacementCycles,
      lifecycleInstances,
    },
    materialFlowBoundary: {
      totalMaterialThroughputKg,
      recoveredMaterialKg,
      reusedMaterialKg,
      recycledMaterialKg,
      disposedMaterialKg,
    },
    avoidedVirginBoundary: {
      avoidedVirginMaterialKg,
      avoidedVirginImpactKgCo2,
    },
    endOfLifeBoundary: {
      linearDisposalImpactKgCo2,
      recoveryProcessingImpactKgCo2,
      reuseProcessingImpactKgCo2,
      residualDisposalImpactKgCo2,
      circularEndOfLifeImpactKgCo2,
      avoidedEndOfLifeImpactKgCo2,
    },
    wholeLifeBoundary: {
      totalAvoidedImpactKgCo2:
        avoidedVirginImpactKgCo2 + avoidedEndOfLifeImpactKgCo2,
    },
  };
}
