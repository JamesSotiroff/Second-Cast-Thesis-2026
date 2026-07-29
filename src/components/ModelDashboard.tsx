"use client";

import { useMemo, useState } from "react";
import { ComparisonChart } from "@/components/ComparisonChart";
import { ParameterPanel } from "@/components/ParameterPanel";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ThesisReference } from "@/components/ThesisReference";
import { getCityPreset } from "@/data/midwest/cities";
import { createDefaultInputs } from "@/data/midwest/defaults";
import {
  getThesisValidationMetrics,
  runModel,
} from "@/lib/model/embodiedCarbon";
import type { ModelInputs } from "@/lib/model/types";

export function ModelDashboard() {
  const [presetId, setPresetId] = useState("thesis");
  const [inputs, setInputs] = useState<ModelInputs>(() => createDefaultInputs());

  const outputs = useMemo(() => runModel(inputs), [inputs]);
  const validation = useMemo(
    () => getThesisValidationMetrics(inputs),
    [inputs],
  );

  const handlePresetChange = (nextPresetId: string) => {
    setPresetId(nextPresetId);
    if (nextPresetId === "custom") {
      return;
    }

    const preset = getCityPreset(nextPresetId);
    setInputs((current) => ({
      ...current,
      transportKmOneWay: preset.transportKmOneWay,
      recycledMaterialTransportKmOneWay: preset.recyclingRadiusKm,
      emissionFactors: { ...preset.emissionFactors },
      unitCosts: { ...preset.unitCosts },
    }));
  };

  const handleReset = () => {
    setPresetId("thesis");
    setInputs(createDefaultInputs());
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Midwest Techno-Economic Analysis
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Second Cast Interactive Model
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Explore embodied carbon and Midwest cost drivers for recycled concrete
          and foam-crete composite wall panels. Defaults align with the ACADIA 2026
          submission (26-panel flatbed batch, 150 km haul, topology-optimized
          composite panels).
        </p>
      </section>

      <div className="grid gap-8 xl:grid-cols-[380px_minmax(0,1fr)]">
        <ParameterPanel
          inputs={inputs}
          presetId={presetId}
          onPresetChange={handlePresetChange}
          onChange={setInputs}
          onReset={handleReset}
        />
        <div className="space-y-8">
          <ResultsPanel outputs={outputs} validation={validation} />
          <ComparisonChart comparison={outputs.comparison} />
        </div>
      </div>

      <ThesisReference />
    </div>
  );
}
