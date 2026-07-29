import { describe, expect, it } from "vitest";
import { runResearchScenario } from "../research";

describe("research scenario runner", () => {
  it("dispatches a slab scenario without losing validation metadata", () => {
    const result = runResearchScenario({
      kind: "slab",
      input: {
        lengthM: 4,
        widthM: 2,
        thicknessM: 0.2,
        voidFraction: 0.2,
        unitCount: 2,
        materials: [
          { id: "dense", densityKgPerM3: 2400, volumeFraction: 0.5 },
          { id: "light", densityKgPerM3: 600, volumeFraction: 0.5 },
        ],
      },
    });

    expect(result.kind).toBe("slab");
    if (result.kind === "slab") {
      expect(result.output.validation.validationStatus).toBe("provisional");
    }
  });
});
