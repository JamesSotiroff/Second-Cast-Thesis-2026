"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CITY_PRESETS } from "@/data/midwest/cities";
import type { ModelInputs, PanelScenario } from "@/lib/model/types";
import { formatNumber, formatPercent } from "@/lib/utils";

interface ParameterPanelProps {
  inputs: ModelInputs;
  presetId: string;
  onPresetChange: (presetId: string) => void;
  onChange: (next: ModelInputs) => void;
  onReset: () => void;
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {suffix ? `: ${suffix}` : ""}
      </Label>
      <Input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        step={step}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  formatValue,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  formatValue?: (value: number) => string;
}) {
  const display = formatValue ? formatValue(value) : String(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="text-sm text-muted-foreground">{display}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}

export function ParameterPanel({
  inputs,
  presetId,
  onPresetChange,
  onChange,
  onReset,
}: ParameterPanelProps) {
  const selectedPreset = CITY_PRESETS.find((preset) => preset.id === presetId);

  const update = (partial: Partial<ModelInputs>) => {
    onChange({ ...inputs, ...partial });
  };

  const updateEmission = (
    key: keyof ModelInputs["emissionFactors"],
    value: number,
  ) => {
    onChange({
      ...inputs,
      emissionFactors: { ...inputs.emissionFactors, [key]: value },
    });
  };

  const updateCost = (key: keyof ModelInputs["unitCosts"], value: number) => {
    onChange({
      ...inputs,
      unitCosts: { ...inputs.unitCosts, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Midwest Region Preset</CardTitle>
          <CardDescription>
            {selectedPreset?.description ?? "Select a Midwest city or thesis default."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="region-preset">Region</Label>
            <Select
              id="region-preset"
              value={presetId}
              onChange={(event) => onPresetChange(event.target.value)}
            >
              {CITY_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="outline" onClick={onReset}>
            Reset to Thesis Defaults
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Scale</CardTitle>
          <CardDescription>Figure 9 batch and transport assumptions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <SliderField
            label="Panel count"
            value={inputs.panelCount}
            onChange={(value) => update({ panelCount: value })}
            min={1}
            max={500}
            step={1}
          />
          <SliderField
            label="Batch size (panels per flatbed)"
            value={inputs.batchSize}
            onChange={(value) => update({ batchSize: value })}
            min={1}
            max={50}
            step={1}
          />
          <SliderField
            label="Transport distance (one-way)"
            value={inputs.transportKmOneWay}
            onChange={(value) => update({ transportKmOneWay: value })}
            min={10}
            max={500}
            step={5}
            formatValue={(value) => `${formatNumber(value, 0)} km`}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inputs.roundTrip}
              onChange={(event) => update({ roundTrip: event.target.checked })}
            />
            Include return trip (round-trip hauling)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technical / Mix Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="scenario">Panel scenario</Label>
            <Select
              id="scenario"
              value={inputs.scenario}
              onChange={(event) =>
                update({ scenario: event.target.value as PanelScenario })
              }
            >
              <option value="solid">Solid Concrete (Baseline)</option>
              <option value="optimized">Optimized Composite</option>
              <option value="kingStud">King-Stud Composite</option>
            </Select>
          </div>
          <SliderField
            label="Optimization mass reduction"
            value={inputs.optimizationMassReduction * 100}
            onChange={(value) =>
              update({ optimizationMassReduction: value / 100 })
            }
            min={0}
            max={33}
            step={1}
            formatValue={(value) => formatPercent(value, 0)}
          />
          <SliderField
            label="Recycled aggregate share"
            value={inputs.recycledAggregatePct * 100}
            onChange={(value) => update({ recycledAggregatePct: value / 100 })}
            min={0}
            max={100}
            step={5}
            formatValue={(value) => formatPercent(value, 0)}
          />
          <SliderField
            label="Foam-crete fill ratio"
            value={inputs.foamCreteFillRatio * 100}
            onChange={(value) => update({ foamCreteFillRatio: value / 100 })}
            min={0}
            max={85}
            step={5}
            formatValue={(value) => formatPercent(value, 0)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emission Factors</CardTitle>
          <CardDescription>Editable kg CO₂ factors cited in the submission scope</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Cement"
            value={inputs.emissionFactors.cementKgCo2PerKg}
            onChange={(value) => updateEmission("cementKgCo2PerKg", value)}
            step={0.01}
          />
          <NumberField
            label="Recycled aggregate"
            value={inputs.emissionFactors.recycledAggregateKgCo2PerKg}
            onChange={(value) =>
              updateEmission("recycledAggregateKgCo2PerKg", value)
            }
            step={0.001}
          />
          <NumberField
            label="Trucking per km per load"
            value={inputs.emissionFactors.truckingKgCo2PerKmPerLoad}
            onChange={(value) =>
              updateEmission("truckingKgCo2PerKmPerLoad", value)
            }
            step={0.01}
          />
          <NumberField
            label="Manufacturing kWh / panel"
            value={inputs.emissionFactors.manufacturingKwhPerPanel}
            onChange={(value) =>
              updateEmission("manufacturingKwhPerPanel", value)
            }
            step={0.1}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Midwest Unit Costs (USD)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Cement ($/kg)"
            value={inputs.unitCosts.cementPerKg}
            onChange={(value) => updateCost("cementPerKg", value)}
            step={0.01}
          />
          <NumberField
            label="Recycled rubble ($/tonne)"
            value={inputs.unitCosts.recycledRubblePerTonne}
            onChange={(value) => updateCost("recycledRubblePerTonne", value)}
            step={1}
          />
          <NumberField
            label="Formwork ($/panel)"
            value={inputs.unitCosts.formworkPerPanel}
            onChange={(value) => updateCost("formworkPerPanel", value)}
            step={1}
          />
          <NumberField
            label="Labor ($/panel)"
            value={inputs.unitCosts.laborPerPanel}
            onChange={(value) => updateCost("laborPerPanel", value)}
            step={1}
          />
          <NumberField
            label="Trucking ($/km)"
            value={inputs.unitCosts.truckingPerKm}
            onChange={(value) => updateCost("truckingPerKm", value)}
            step={0.05}
          />
          <NumberField
            label="Trucking base ($/load)"
            value={inputs.unitCosts.truckingBasePerLoad}
            onChange={(value) => updateCost("truckingBasePerLoad", value)}
            step={5}
          />
          <NumberField
            label="Carbon price ($/tCO₂)"
            value={inputs.carbonPricePerTonne}
            onChange={(value) => update({ carbonPricePerTonne: value })}
            step={5}
          />
        </CardContent>
      </Card>
    </div>
  );
}
