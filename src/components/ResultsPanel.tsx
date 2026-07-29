"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThesisEvidenceLink } from "@/components/ThesisEvidenceLink";
import type { ModelOutputs } from "@/lib/model/types";
import {
  THESIS_CARBON_REDUCTION,
  THESIS_MASS_REDUCTION,
} from "@/lib/model/panelGeometry";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/utils";

interface ResultsPanelProps {
  outputs: ModelOutputs;
  validation: {
    massReductionPct: number;
    carbonReductionPct: number;
  };
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border border-border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ResultsPanel({ outputs, validation }: ResultsPanelProps) {
  const { active } = outputs;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Scenario: {active.label}</CardTitle>
          <CardDescription>
            Live results for the selected panel type and Midwest inputs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Metric
            label="Panel Mass"
            value={`${formatNumber(active.panelMassKg, 0)} kg`}
          />
          <Metric
            label="Total Project Mass"
            value={`${formatNumber(active.totalMassKg, 0)} kg`}
          />
          <Metric
            label="Embodied Carbon"
            value={`${formatNumber(active.carbon.totalKgCo2, 0)} kg CO₂`}
            hint={`Materials ${formatNumber(active.carbon.materialsKgCo2, 0)} · Transport ${formatNumber(active.carbon.transportKgCo2, 0)}`}
          />
          <Metric
            label="Total Project Cost"
            value={formatCurrency(active.cost.totalUsd)}
            hint={`${formatCurrency(active.costPerPanelUsd)} / panel`}
          />
          <Metric
            label="Truck Loads"
            value={`${active.truckLoads} delivery · ${active.recycledMaterialLoads} material`}
            hint={`${formatNumber(active.panelDeliveryKm, 0)} km delivery · ${formatNumber(active.recycledMaterialKm, 0)} km recycled-material sourcing`}
          />
          <Metric
            label="Savings vs Solid Baseline"
            value={
              active.carbonSavingsVsSolidPct === null
                ? "—"
                : formatPercent(active.carbonSavingsVsSolidPct)
            }
            hint={
              active.costDeltaVsSolidPct === null
                ? undefined
                : `Cost delta ${formatPercent(active.costDeltaVsSolidPct)}`
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thesis Validation (Optimized vs Solid)</CardTitle>
          <CardDescription>
            At current inputs, compared to ACADIA headline results (~33% mass, ~30%
            carbon).
            <span className="mt-2 block">
              <ThesisEvidenceLink evidenceId="headline-reductions">
                Show the exact thesis blurb
              </ThesisEvidenceLink>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Metric
            label="Modeled Mass Reduction"
            value={formatPercent(validation.massReductionPct)}
            hint={`Target from submission: ~${formatPercent(THESIS_MASS_REDUCTION * 100, 0)}`}
          />
          <Metric
            label="Modeled Carbon Reduction"
            value={formatPercent(validation.carbonReductionPct)}
            hint={`Target from submission: ~${formatPercent(THESIS_CARBON_REDUCTION * 100, 0)}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Materials" value={formatCurrency(active.cost.materialsUsd)} />
          <Metric label="Formwork" value={formatCurrency(active.cost.formworkUsd)} />
          <Metric label="Labor" value={formatCurrency(active.cost.laborUsd)} />
          <Metric
            label="Transport"
            value={formatCurrency(active.cost.transportUsd)}
            hint={`${formatCurrency(active.cost.panelDeliveryUsd)} delivery · ${formatCurrency(active.cost.recycledMaterialTransportUsd)} material sourcing`}
          />
          <Metric label="Carbon Price" value={formatCurrency(active.cost.carbonCostUsd)} />
        </CardContent>
      </Card>
    </div>
  );
}
