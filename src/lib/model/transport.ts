export function computeTruckLoads(panelCount: number, batchSize: number): number {
  if (panelCount <= 0 || batchSize <= 0) {
    return 0;
  }
  return Math.ceil(panelCount / batchSize);
}

export function computeTransportKm(
  transportKmOneWay: number,
  roundTrip: boolean,
  truckLoads: number,
): number {
  const tripMultiplier = roundTrip ? 2 : 1;
  return transportKmOneWay * tripMultiplier * truckLoads;
}

export function computeTransportMassKg(
  panelMassKg: number,
  panelCount: number,
): number {
  return panelMassKg * panelCount;
}
