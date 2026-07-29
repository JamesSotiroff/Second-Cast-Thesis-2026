import {
  calculateCircularityImpacts,
  calculateThermalOperationalImpacts,
  evaluateExperimentalColumn,
  evaluateExperimentalSlab,
  type CircularityCalculationInputs,
  type ColumnModelInput,
  type SlabModelInput,
  type ThermalCalculationInputs,
} from "./modules";

export type ResearchScenario =
  | { kind: "slab"; input: SlabModelInput }
  | { kind: "column"; input: ColumnModelInput }
  | { kind: "thermal"; input: ThermalCalculationInputs }
  | { kind: "circularity"; input: CircularityCalculationInputs };

export type ResearchResult =
  | { kind: "slab"; output: ReturnType<typeof evaluateExperimentalSlab> }
  | { kind: "column"; output: ReturnType<typeof evaluateExperimentalColumn> }
  | {
      kind: "thermal";
      output: ReturnType<typeof calculateThermalOperationalImpacts>;
    }
  | {
      kind: "circularity";
      output: ReturnType<typeof calculateCircularityImpacts>;
    };

export function runResearchScenario(scenario: ResearchScenario): ResearchResult {
  switch (scenario.kind) {
    case "slab":
      return { kind: "slab", output: evaluateExperimentalSlab(scenario.input) };
    case "column":
      return {
        kind: "column",
        output: evaluateExperimentalColumn(scenario.input),
      };
    case "thermal":
      return {
        kind: "thermal",
        output: calculateThermalOperationalImpacts(scenario.input),
      };
    case "circularity":
      return {
        kind: "circularity",
        output: calculateCircularityImpacts(scenario.input),
      };
  }
}
