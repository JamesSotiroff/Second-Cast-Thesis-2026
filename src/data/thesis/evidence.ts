export type EvidenceStatus = "direct" | "derived" | "provisional";

export interface ThesisEvidence {
  id: string;
  assumption: string;
  status: EvidenceStatus;
  page: number | null;
  location: string;
  before?: string;
  highlight?: string;
  after?: string;
  explanation: string;
}

export const THESIS_EVIDENCE: ThesisEvidence[] = [
  {
    id: "panel-dimensions",
    assumption: "4 ft × 4 ft × 4 in panel dimensions",
    status: "direct",
    page: 2,
    location: "Section 3, Computationally Optimized Wall Panel",
    before: "The wall design explores a ",
    highlight: "4’-0” x 4’-0” x 0’-4” panel",
    after:
      " with an offset rectangular opening, creating a non-uniform element to study a compression-driven form-finding optimization.",
    explanation: "The model converts these stated dimensions from feet to metres.",
  },
  {
    id: "optimized-mass",
    assumption: "Optimized panel mass of 156 kg",
    status: "direct",
    page: 7,
    location: "Figure 7, Optimized Wall Panel",
    before:
      "A 4’-0” x 4’-0” optimized composite wall panel with a concrete outer shell and branches design only where structurally needed and non-structural filler zones of foam-crete results in a panel weight of ",
    highlight: "approximately 156 kg.",
    explanation: "This is the optimized scenario reference mass.",
  },
  {
    id: "king-stud-mass",
    assumption: "King-stud panel mass of 168 kg",
    status: "direct",
    page: 7,
    location: "Figure 8, King-Stud Wall Panel",
    before:
      "A comparable panel based on traditional king-stud framing was cast to compare structural loading performance. With a concrete outer shell and non-structural filler zones of foam-crete, the panel weighs ",
    highlight: "approximately 168 kg.",
    explanation: "This is the king-stud scenario reference endpoint.",
  },
  {
    id: "headline-reductions",
    assumption: "33% mass and approximately 30% carbon reduction",
    status: "direct",
    page: 2,
    location: "Section 4, Environmental Impact and Application",
    before: "The analysis found that the final panel design achieves ",
    highlight:
      "up to a 33% reduction in mass and approximately 30% reduction in embodied carbon",
    after:
      " relative to a baseline solid concrete panel with no topological or material optimization, considering only manufacturing and transportation impacts.",
    explanation:
      "The app treats these values as validation targets, not independent proof of its formulas.",
  },
  {
    id: "batch-and-distance",
    assumption: "26-panel load and 150 km one-way delivery",
    status: "direct",
    page: 8,
    location: "Figure 9, Embodied Carbon",
    before: "Embodied carbon implications based on degree of optimization and considering a ",
    highlight:
      "production batch of 26 precast panels (equivalent to a single flatbed truck load arranged in one layer) transported from the manufacturing facility and recycling source to a building site 150 km away (one-way trip).",
    explanation:
      "These values initialize panel batching and finished-panel delivery distance.",
  },
  {
    id: "foam-mixture",
    assumption: "Foam-crete mixture variables",
    status: "direct",
    page: 4,
    location: "Figure 3, Mixture Testing",
    before:
      "Twenty tests were developed to control different densities of the foam concrete, including density grading across a single cast to test bonding adhesion between the different mixes. ",
    highlight:
      "Concrete mixture variables including accelerator volume, sand, cement, polymer, and timing were all tested.",
    after:
      " Including the mixture of concrete and foam at 15-minute intervals after the addition of accelerator to the concrete.",
    explanation:
      "The thesis identifies variables but does not publish the mass fractions used by the app.",
  },
  {
    id: "operational-exclusion",
    assumption: "Operational and thermal performance exclusion",
    status: "direct",
    page: 9,
    location: "Figure 10, Wall Comparison",
    before: "That said, this study evaluates only embodied emissions and ",
    highlight:
      "does not account for operational performance (e.g., thermal behavior).",
    explanation:
      "Thermal calculations are therefore isolated in an experimental research module.",
  },
  {
    id: "solid-baseline",
    assumption: "Derived solid-panel mass",
    status: "derived",
    page: null,
    location: "Application derivation",
    explanation:
      "No thesis blurb states the solid mass. The app derives 232.84 kg from the cited 156 kg optimized mass and 33% reduction: 156 ÷ (1 − 0.33).",
  },
  {
    id: "regional-factors",
    assumption: "Midwest prices, grid factors, and city distances",
    status: "provisional",
    page: null,
    location: "Application assumption",
    explanation:
      "No supporting thesis blurb was found. These defaults are provisional placeholders until authoritative regional data is supplied.",
  },
  {
    id: "mix-coefficients",
    assumption: "Material fractions and foam-fill coefficients",
    status: "provisional",
    page: null,
    location: "Application assumption",
    explanation:
      "The thesis names tested mixture variables but does not publish the numerical coefficients encoded by the model.",
  },
  {
    id: "return-trip",
    assumption: "Automatic truck return trip",
    status: "provisional",
    page: null,
    location: "Application assumption",
    explanation:
      "Figure 9 specifies a one-way distance. The app's default inclusion of a return trip is not stated in the thesis.",
  },
];

export function getThesisEvidence(id: string): ThesisEvidence {
  return THESIS_EVIDENCE.find((item) => item.id === id) ?? THESIS_EVIDENCE[0];
}
