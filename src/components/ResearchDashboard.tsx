"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  calculateCircularityImpacts,
  calculateThermalOperationalImpacts,
  compareColumnToReference,
  compareSlabToReference,
  evaluateExperimentalColumn,
  evaluateExperimentalSlab,
} from "@/lib/model/modules";
import { formatNumber } from "@/lib/utils";

type ModuleKind = "slab" | "column" | "thermal" | "circularity";

function Field({
  label,
  value,
  onChange,
  step = 0.1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(event) =>
            onChange(Math.max(Number(event.target.value) || 0, 0))
          }
        />
        {suffix ? <span className="text-xs text-muted-foreground">{suffix}</span> : null}
      </div>
    </div>
  );
}

function Output({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function SlabModule() {
  const [lengthM, setLengthM] = useState(4);
  const [widthM, setWidthM] = useState(2);
  const [thicknessM, setThicknessM] = useState(0.2);
  const [voidPct, setVoidPct] = useState(20);
  const [lightweightPct, setLightweightPct] = useState(40);
  const [unitCount, setUnitCount] = useState(10);

  const { result, comparison } = useMemo(() => {
    const candidate = evaluateExperimentalSlab({
        lengthM,
        widthM,
        thicknessM,
        voidFraction: Math.min(voidPct / 100, 1),
        unitCount: Math.round(unitCount),
        transportPayloadCapacityKg: 18_000,
        materials: [
          {
            id: "dense-concrete",
            densityKgPerM3: 2400,
            volumeFraction: 1 - Math.min(lightweightPct / 100, 1),
          },
          {
            id: "lightweight-fill",
            densityKgPerM3: 600,
            volumeFraction: Math.min(lightweightPct / 100, 1),
          },
        ],
      });
    const reference = evaluateExperimentalSlab({
      lengthM,
      widthM,
      thicknessM,
      voidFraction: 0,
      unitCount: Math.round(unitCount),
      transportPayloadCapacityKg: 18_000,
      materials: [
        { id: "dense-concrete", densityKgPerM3: 2400, volumeFraction: 1 },
      ],
    });
    return {
      result: candidate,
      comparison: compareSlabToReference(candidate, reference, "solid-slab"),
    };
  }, [lengthM, widthM, thicknessM, voidPct, lightweightPct, unitCount]);

  return (
    <ModuleLayout
      title="Experimental Slab"
      description="Rectangular-prism geometry and mass/transport arithmetic. No structural-capacity claim."
      fields={
        <>
          <Field label="Length" value={lengthM} onChange={setLengthM} suffix="m" />
          <Field label="Width" value={widthM} onChange={setWidthM} suffix="m" />
          <Field label="Thickness" value={thicknessM} onChange={setThicknessM} step={0.01} suffix="m" />
          <Field label="Void fraction" value={voidPct} onChange={setVoidPct} step={1} suffix="%" />
          <Field label="Lightweight fill" value={lightweightPct} onChange={setLightweightPct} step={1} suffix="%" />
          <Field label="Unit count" value={unitCount} onChange={setUnitCount} step={1} />
        </>
      }
      outputs={
        <>
          <Output label="Net volume / unit" value={`${formatNumber(result.geometry.netVolumeM3, 2)} m³`} />
          <Output label="Mass / unit" value={`${formatNumber(result.materials.unitMassKg, 0)} kg`} />
          <Output label="Total transport mass" value={`${formatNumber(result.transport.totalMassKg, 0)} kg`} />
          <Output label="Estimated truck loads" value={String(result.transport.estimatedLoads ?? "—")} />
          <Output
            label="Mass change vs solid reference"
            value={`${formatNumber(comparison.percentChanges.unitMassPct ?? 0, 1)}%`}
          />
        </>
      }
    />
  );
}

function ColumnModule() {
  const [heightM, setHeightM] = useState(3);
  const [widthM, setWidthM] = useState(0.4);
  const [depthM, setDepthM] = useState(0.4);
  const [voidPct, setVoidPct] = useState(15);
  const [unitCount, setUnitCount] = useState(12);

  const { result, comparison } = useMemo(() => {
    const candidate = evaluateExperimentalColumn({
        heightM,
        crossSection: { shape: "rectangular", widthM, depthM },
        voidFraction: Math.min(voidPct / 100, 1),
        unitCount: Math.round(unitCount),
        transportPayloadCapacityKg: 18_000,
        materials: [{ id: "provisional-concrete", densityKgPerM3: 2200, volumeFraction: 1 }],
      });
    const reference = evaluateExperimentalColumn({
      heightM,
      crossSection: { shape: "rectangular", widthM, depthM },
      voidFraction: 0,
      unitCount: Math.round(unitCount),
      transportPayloadCapacityKg: 18_000,
      materials: [
        { id: "solid-concrete", densityKgPerM3: 2400, volumeFraction: 1 },
      ],
    });
    return {
      result: candidate,
      comparison: compareColumnToReference(candidate, reference, "solid-column"),
    };
  }, [heightM, widthM, depthM, voidPct, unitCount]);

  return (
    <ModuleLayout
      title="Experimental Column"
      description="Constant-section geometry and mass/transport arithmetic. Buckling, loads, reinforcement, and code checks are excluded."
      fields={
        <>
          <Field label="Height" value={heightM} onChange={setHeightM} suffix="m" />
          <Field label="Width" value={widthM} onChange={setWidthM} step={0.05} suffix="m" />
          <Field label="Depth" value={depthM} onChange={setDepthM} step={0.05} suffix="m" />
          <Field label="Void fraction" value={voidPct} onChange={setVoidPct} step={1} suffix="%" />
          <Field label="Unit count" value={unitCount} onChange={setUnitCount} step={1} />
        </>
      }
      outputs={
        <>
          <Output label="Cross-section area" value={`${formatNumber(result.geometry.crossSectionAreaM2, 2)} m²`} />
          <Output label="Mass / unit" value={`${formatNumber(result.materials.unitMassKg, 0)} kg`} />
          <Output label="Total transport mass" value={`${formatNumber(result.transport.totalMassKg, 0)} kg`} />
          <Output label="Estimated truck loads" value={String(result.transport.estimatedLoads ?? "—")} />
          <Output
            label="Mass change vs solid reference"
            value={`${formatNumber(comparison.percentChanges.unitMassPct ?? 0, 1)}%`}
          />
        </>
      }
    />
  );
}

function ThermalModule() {
  const [areaM2, setAreaM2] = useState(100);
  const [baselineU, setBaselineU] = useState(0.5);
  const [proposedU, setProposedU] = useState(0.3);
  const [annualDelta, setAnnualDelta] = useState(2500);
  const [emissionFactor, setEmissionFactor] = useState(0.45);
  const [serviceLife, setServiceLife] = useState(50);
  const [embodiedPremium, setEmbodiedPremium] = useState(1000);

  const result = useMemo(
    () =>
      calculateThermalOperationalImpacts({
        assembly: {
          areaM2,
          baseline: { uValueWPerM2K: Math.max(baselineU, 0.001) },
          proposed: { uValueWPerM2K: Math.max(proposedU, 0.001) },
        },
        energy: {
          approach: "annualEnergyDelta",
          annualEnergyDeltaKwh: annualDelta,
          energyEmissionFactorKgCo2PerKwh: emissionFactor,
        },
        serviceLifeYears: Math.max(serviceLife, 1),
        incrementalEmbodiedKgCo2: embodiedPremium,
      }),
    [areaM2, baselineU, proposedU, annualDelta, emissionFactor, serviceLife, embodiedPremium],
  );

  return (
    <ModuleLayout
      title="Experimental Thermal / Operational"
      description="Opt-in whole-life comparison kept separate from the thesis manufacturing-and-transport boundary."
      fields={
        <>
          <Field label="Assembly area" value={areaM2} onChange={setAreaM2} suffix="m²" />
          <Field label="Baseline U-value" value={baselineU} onChange={setBaselineU} step={0.01} suffix="W/m²K" />
          <Field label="Proposed U-value" value={proposedU} onChange={setProposedU} step={0.01} suffix="W/m²K" />
          <Field label="Annual energy avoided" value={annualDelta} onChange={setAnnualDelta} step={100} suffix="kWh" />
          <Field label="Energy emissions factor" value={emissionFactor} onChange={setEmissionFactor} step={0.01} suffix="kg CO₂/kWh" />
          <Field label="Service life" value={serviceLife} onChange={setServiceLife} step={1} suffix="years" />
          <Field label="Incremental embodied impact" value={embodiedPremium} onChange={setEmbodiedPremium} step={100} suffix="kg CO₂" />
        </>
      }
      outputs={
        <>
          <Output label="Annual emissions avoided" value={`${formatNumber(result.operationalBoundary.annualEmissionsAvoidedKgCo2, 0)} kg CO₂`} />
          <Output label="Lifetime emissions avoided" value={`${formatNumber(result.operationalBoundary.lifetimeEmissionsAvoidedKgCo2, 0)} kg CO₂`} />
          <Output label="Net whole-life avoided" value={`${formatNumber(result.wholeLifeBoundary.netEmissionsAvoidedKgCo2, 0)} kg CO₂`} />
          <Output label="Embodied break-even" value={result.breakEven.years === null ? "No break-even" : `${formatNumber(result.breakEven.years, 1)} years`} />
        </>
      }
    />
  );
}

function CircularityModule() {
  const [massKg, setMassKg] = useState(10_000);
  const [serviceLife, setServiceLife] = useState(50);
  const [replacementCycles, setReplacementCycles] = useState(0);
  const [recoveryPct, setRecoveryPct] = useState(80);
  const [reusePct, setReusePct] = useState(30);
  const [displacementPct, setDisplacementPct] = useState(70);

  const result = useMemo(
    () =>
      calculateCircularityImpacts({
        materialMassKg: massKg,
        serviceLifeYears: Math.max(serviceLife, 1),
        replacementCycles: Math.round(replacementCycles),
        recoveryRate: Math.min(recoveryPct / 100, 1),
        reuseRate: Math.min(reusePct / 100, 1),
        recycledVirginDisplacementRate: Math.min(displacementPct / 100, 1),
        virginMaterialImpactKgCo2PerKg: 0.1,
        endOfLife: {
          disposalImpactKgCo2PerKg: 0.01,
          recoveryProcessingImpactKgCo2PerKg: 0.02,
          reuseProcessingImpactKgCo2PerKg: 0.005,
        },
      }),
    [massKg, serviceLife, replacementCycles, recoveryPct, reusePct, displacementPct],
  );

  return (
    <ModuleLayout
      title="Experimental Circular Design"
      description="Material-flow scenario with provisional impact factors; results are outside the original thesis boundary."
      fields={
        <>
          <Field label="Material mass" value={massKg} onChange={setMassKg} step={100} suffix="kg" />
          <Field label="Service life" value={serviceLife} onChange={setServiceLife} step={1} suffix="years" />
          <Field label="Replacement cycles" value={replacementCycles} onChange={setReplacementCycles} step={1} />
          <Field label="Recovery rate" value={recoveryPct} onChange={setRecoveryPct} step={5} suffix="%" />
          <Field label="Reuse share of recovery" value={reusePct} onChange={setReusePct} step={5} suffix="%" />
          <Field label="Recycled virgin displacement" value={displacementPct} onChange={setDisplacementPct} step={5} suffix="%" />
        </>
      }
      outputs={
        <>
          <Output label="Recovered material" value={`${formatNumber(result.materialFlowBoundary.recoveredMaterialKg, 0)} kg`} />
          <Output label="Avoided virgin material" value={`${formatNumber(result.avoidedVirginBoundary.avoidedVirginMaterialKg, 0)} kg`} />
          <Output label="Avoided virgin impact" value={`${formatNumber(result.avoidedVirginBoundary.avoidedVirginImpactKgCo2, 0)} kg CO₂`} />
          <Output label="Total avoided impact" value={`${formatNumber(result.wholeLifeBoundary.totalAvoidedImpactKgCo2, 0)} kg CO₂`} />
        </>
      }
    />
  );
}

function ModuleLayout({
  title,
  description,
  fields,
  outputs,
}: {
  title: string;
  description: string;
  fields: React.ReactNode;
  outputs: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>{title} Inputs</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">{fields}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{title} Results</CardTitle>
          <CardDescription>Experimental arithmetic using provisional assumptions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">{outputs}</CardContent>
      </Card>
    </div>
  );
}

export function ResearchDashboard() {
  const [module, setModule] = useState<ModuleKind>("slab");

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Experimental Research Modules
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Extended Second Cast Scenarios
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          These calculators are provisional research tools, not validated thesis
          findings. Replace demonstration assumptions with authoritative project
          data before using results in design or publication.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Research module</CardTitle>
          <CardDescription>The validated wall-panel demo remains under Interactive Model.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={module}
            onChange={(event) => setModule(event.target.value as ModuleKind)}
            aria-label="Research module"
          >
            <option value="slab">Slab geometry and mass</option>
            <option value="column">Column geometry and mass</option>
            <option value="thermal">Thermal / operational comparison</option>
            <option value="circularity">Circular-design scenario</option>
          </Select>
        </CardContent>
      </Card>

      {module === "slab" ? <SlabModule /> : null}
      {module === "column" ? <ColumnModule /> : null}
      {module === "thermal" ? <ThermalModule /> : null}
      {module === "circularity" ? <CircularityModule /> : null}
    </div>
  );
}
