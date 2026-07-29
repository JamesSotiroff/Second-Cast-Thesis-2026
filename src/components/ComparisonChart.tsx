"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScenarioResult } from "@/lib/model/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface ComparisonChartProps {
  comparison: ScenarioResult[];
}

export function ComparisonChart({ comparison }: ComparisonChartProps) {
  const data = comparison.map((item) => ({
    name: item.scenario === "solid"
      ? "Solid"
      : item.scenario === "optimized"
        ? "Optimized"
        : "King-Stud",
    mass: item.totalMassKg,
    carbon: item.carbon.totalKgCo2,
    cost: item.cost.totalUsd,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Embodied Carbon Comparison</CardTitle>
          <CardDescription>Manufacturing + transport scope (kg CO₂)</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatNumber(value, 0)} />
              <Legend />
              <Bar dataKey="carbon" name="Embodied CO₂ (kg)" fill="#475569" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Cost Comparison</CardTitle>
          <CardDescription>Materials, labor, formwork, and transport</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="cost" name="Total Cost (USD)" fill="#78716c" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Mass Comparison</CardTitle>
          <CardDescription>Total project mass across panel scenarios</CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${formatNumber(value, 0)} kg`} />
              <Legend />
              <Bar dataKey="mass" name="Total Mass (kg)" fill="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
