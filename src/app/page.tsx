import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { THESIS_PDF_PATH } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Functionally Graded Composite Walls
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight">
          Second Cast: Recycled Concrete and Foam-Crete
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          This repository hosts the ACADIA 2026 project submission and an
          interactive techno-economic model for Midwest deployment scenarios.
          The model encodes embodied carbon drivers from the submission and extends
          them with configurable material, labor, and trucking costs.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/model/"
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Open Interactive Model
          </Link>
          <a
            href={THESIS_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-input bg-background px-5 py-2.5 text-sm font-medium hover:bg-accent"
          >
            Read Submission PDF
          </a>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>33% Mass Reduction</CardTitle>
            <CardDescription>Topology-optimized composite panel</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Optimized panels weigh approximately 156 kg versus a solid baseline,
            preserving structural load paths while replacing filler zones with
            foam-crete.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>~30% Embodied Carbon Savings</CardTitle>
            <CardDescription>Manufacturing + transport scope</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The submission evaluates a 26-panel flatbed batch hauled 150 km to
            site, excluding operational energy performance.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Midwest Context</CardTitle>
            <CardDescription>Regional presets and editable costs</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ann Arbor, Detroit, Chicago, and Columbus presets adjust haul distances,
            MISO grid factors, and NRMCA-style material cost placeholders.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
