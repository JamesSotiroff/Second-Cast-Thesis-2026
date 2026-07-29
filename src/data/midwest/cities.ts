import type { MidwestPreset } from "./defaults";
import {
  MIDWEST_EMISSION_FACTORS,
  MIDWEST_UNIT_COSTS,
  THESIS_EMISSION_FACTORS,
  THESIS_UNIT_COSTS,
} from "./defaults";
import { THESIS_TRANSPORT_KM } from "@/lib/model/panelGeometry";

export interface CityPreset extends MidwestPreset {
  state: string;
  recyclingRadiusKm: number;
}

export const CITY_PRESETS: CityPreset[] = [
  {
    id: "thesis",
    label: "Thesis Default (Figure 9)",
    state: "Generic",
    description: "Matches ACADIA submission: 150 km haul, 26-panel batch.",
    validationStatus: "thesis-cited",
    sources: ["ACADIA 2026 submission, Figures 7–9"],
    transportKmOneWay: THESIS_TRANSPORT_KM,
    recyclingRadiusKm: 50,
    emissionFactors: THESIS_EMISSION_FACTORS,
    unitCosts: THESIS_UNIT_COSTS,
  },
  {
    id: "ann-arbor",
    label: "Ann Arbor, MI",
    state: "Michigan",
    description: "UMich context; shorter haul to regional precast and C&D recycling.",
    validationStatus: "provisional",
    sources: ["Provisional project assumptions; awaiting supplied regional data"],
    transportKmOneWay: 80,
    recyclingRadiusKm: 35,
    emissionFactors: MIDWEST_EMISSION_FACTORS,
    unitCosts: {
      ...MIDWEST_UNIT_COSTS,
      laborPerPanel: 44,
      recycledRubblePerTonne: 9,
    },
  },
  {
    id: "detroit",
    label: "Detroit, MI",
    state: "Michigan",
    description: "Dense C&D recycling infrastructure; shorter trucking distances.",
    validationStatus: "provisional",
    sources: ["Provisional project assumptions; awaiting supplied regional data"],
    transportKmOneWay: 60,
    recyclingRadiusKm: 25,
    emissionFactors: MIDWEST_EMISSION_FACTORS,
    unitCosts: {
      ...MIDWEST_UNIT_COSTS,
      recycledRubblePerTonne: 8,
      truckingPerKm: 2.2,
    },
  },
  {
    id: "chicago",
    label: "Chicago, IL",
    state: "Illinois",
    description: "Larger metro area with longer average material haul distances.",
    validationStatus: "provisional",
    sources: ["Provisional project assumptions; awaiting supplied regional data"],
    transportKmOneWay: 120,
    recyclingRadiusKm: 45,
    emissionFactors: {
      ...MIDWEST_EMISSION_FACTORS,
      manufacturingKgCo2PerKwh: 0.42,
    },
    unitCosts: {
      ...MIDWEST_UNIT_COSTS,
      cementPerKg: 0.19,
      laborPerPanel: 48,
      truckingPerKm: 2.65,
    },
  },
  {
    id: "columbus",
    label: "Columbus, OH",
    state: "Ohio",
    description: "Midwest average haul and material pricing.",
    validationStatus: "provisional",
    sources: ["Provisional project assumptions; awaiting supplied regional data"],
    transportKmOneWay: 100,
    recyclingRadiusKm: 40,
    emissionFactors: MIDWEST_EMISSION_FACTORS,
    unitCosts: MIDWEST_UNIT_COSTS,
  },
  {
    id: "custom",
    label: "Custom",
    state: "User-defined",
    description: "Manual transport distance and unit costs.",
    validationStatus: "user-defined",
    sources: ["Values entered by the user"],
    transportKmOneWay: THESIS_TRANSPORT_KM,
    recyclingRadiusKm: 50,
    emissionFactors: THESIS_EMISSION_FACTORS,
    unitCosts: THESIS_UNIT_COSTS,
  },
];

export function getCityPreset(id: string): CityPreset {
  return CITY_PRESETS.find((preset) => preset.id === id) ?? CITY_PRESETS[0];
}
