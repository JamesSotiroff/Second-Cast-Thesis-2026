export const SLAB_MODEL_VALIDATION = {
  maturity: "experimental",
  validationStatus: "provisional",
  validatedFor: ["dimensional arithmetic", "mass balance", "transport aggregation"],
  notValidatedFor: [
    "structural capacity",
    "building-code compliance",
    "embodied-carbon performance",
    "cost performance",
  ],
  assumptions: [
    "The slab is represented as a rectangular prism.",
    "Void fraction is uniformly deducted from gross volume.",
    "Material volume fractions apply to net volume and must sum to one.",
  ],
} as const;

export interface SlabMaterialInput {
  id: string;
  densityKgPerM3: number;
  volumeFraction: number;
}

export interface SlabModelInput {
  lengthM: number;
  widthM: number;
  thicknessM: number;
  voidFraction: number;
  unitCount: number;
  materials: readonly SlabMaterialInput[];
  transportPayloadCapacityKg?: number;
}

export interface SlabMaterialOutput {
  id: string;
  densityKgPerM3: number;
  volumeFraction: number;
  volumeM3: number;
  massKg: number;
}

export interface SlabModelOutput {
  module: "experimental-slab";
  validation: typeof SLAB_MODEL_VALIDATION;
  geometry: {
    shape: "rectangular-prism";
    lengthM: number;
    widthM: number;
    thicknessM: number;
    grossVolumeM3: number;
    voidVolumeM3: number;
    netVolumeM3: number;
  };
  materials: {
    items: SlabMaterialOutput[];
    unitMassKg: number;
  };
  transport: {
    unitCount: number;
    unitMassKg: number;
    totalMassKg: number;
    payloadCapacityKg: number | null;
    estimatedLoads: number | null;
  };
}

export interface SlabReferenceComparison {
  referenceId: string;
  candidate: SlabModelOutput;
  reference: SlabModelOutput;
  deltas: {
    netVolumeM3: number;
    unitMassKg: number;
    totalTransportMassKg: number;
  };
  percentChanges: {
    netVolumePct: number | null;
    unitMassPct: number | null;
    totalTransportMassPct: number | null;
  };
  interpretation: "arithmetic-comparison-only";
}

function assertFiniteNonnegative(name: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be finite and nonnegative`);
  }
}

function percentChange(candidate: number, reference: number): number | null {
  return reference === 0 ? null : ((candidate - reference) / reference) * 100;
}

export function evaluateExperimentalSlab(input: SlabModelInput): SlabModelOutput {
  assertFiniteNonnegative("lengthM", input.lengthM);
  assertFiniteNonnegative("widthM", input.widthM);
  assertFiniteNonnegative("thicknessM", input.thicknessM);
  assertFiniteNonnegative("voidFraction", input.voidFraction);
  assertFiniteNonnegative("unitCount", input.unitCount);

  if (input.voidFraction > 1) {
    throw new RangeError("voidFraction must not exceed one");
  }
  if (!Number.isInteger(input.unitCount)) {
    throw new RangeError("unitCount must be an integer");
  }
  if (input.materials.length === 0) {
    throw new RangeError("materials must contain at least one item");
  }
  if (
    input.transportPayloadCapacityKg !== undefined &&
    input.transportPayloadCapacityKg <= 0
  ) {
    throw new RangeError("transportPayloadCapacityKg must be greater than zero");
  }
  if (input.transportPayloadCapacityKg !== undefined) {
    assertFiniteNonnegative(
      "transportPayloadCapacityKg",
      input.transportPayloadCapacityKg,
    );
  }

  const materialIds = new Set<string>();
  let fractionSum = 0;
  for (const material of input.materials) {
    if (material.id.trim() === "") {
      throw new RangeError("material id must not be empty");
    }
    if (materialIds.has(material.id)) {
      throw new RangeError(`material id must be unique: ${material.id}`);
    }
    materialIds.add(material.id);
    assertFiniteNonnegative(
      `materials[${material.id}].densityKgPerM3`,
      material.densityKgPerM3,
    );
    assertFiniteNonnegative(
      `materials[${material.id}].volumeFraction`,
      material.volumeFraction,
    );
    fractionSum += material.volumeFraction;
  }
  if (Math.abs(fractionSum - 1) > 1e-9) {
    throw new RangeError("material volume fractions must sum to one");
  }

  const grossVolumeM3 = input.lengthM * input.widthM * input.thicknessM;
  const voidVolumeM3 = grossVolumeM3 * input.voidFraction;
  const netVolumeM3 = grossVolumeM3 - voidVolumeM3;
  const items = input.materials.map((material) => {
    const volumeM3 = netVolumeM3 * material.volumeFraction;
    return {
      ...material,
      volumeM3,
      massKg: volumeM3 * material.densityKgPerM3,
    };
  });
  const unitMassKg = items.reduce((sum, material) => sum + material.massKg, 0);
  const totalMassKg = unitMassKg * input.unitCount;
  const payloadCapacityKg = input.transportPayloadCapacityKg ?? null;

  return {
    module: "experimental-slab",
    validation: SLAB_MODEL_VALIDATION,
    geometry: {
      shape: "rectangular-prism",
      lengthM: input.lengthM,
      widthM: input.widthM,
      thicknessM: input.thicknessM,
      grossVolumeM3,
      voidVolumeM3,
      netVolumeM3,
    },
    materials: { items, unitMassKg },
    transport: {
      unitCount: input.unitCount,
      unitMassKg,
      totalMassKg,
      payloadCapacityKg,
      estimatedLoads:
        payloadCapacityKg === null
          ? null
          : totalMassKg === 0
            ? 0
            : Math.ceil(totalMassKg / payloadCapacityKg),
    },
  };
}

export function compareSlabToReference(
  candidate: SlabModelOutput,
  reference: SlabModelOutput,
  referenceId: string,
): SlabReferenceComparison {
  if (referenceId.trim() === "") {
    throw new RangeError("referenceId must not be empty");
  }

  return {
    referenceId,
    candidate,
    reference,
    deltas: {
      netVolumeM3: candidate.geometry.netVolumeM3 - reference.geometry.netVolumeM3,
      unitMassKg: candidate.materials.unitMassKg - reference.materials.unitMassKg,
      totalTransportMassKg:
        candidate.transport.totalMassKg - reference.transport.totalMassKg,
    },
    percentChanges: {
      netVolumePct: percentChange(
        candidate.geometry.netVolumeM3,
        reference.geometry.netVolumeM3,
      ),
      unitMassPct: percentChange(
        candidate.materials.unitMassKg,
        reference.materials.unitMassKg,
      ),
      totalTransportMassPct: percentChange(
        candidate.transport.totalMassKg,
        reference.transport.totalMassKg,
      ),
    },
    interpretation: "arithmetic-comparison-only",
  };
}
