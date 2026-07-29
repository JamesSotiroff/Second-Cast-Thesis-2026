"use client";

import { useEffect, useState } from "react";
import { THESIS_EVIDENCE_EVENT } from "@/components/ThesisEvidenceLink";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getThesisEvidence,
  THESIS_EVIDENCE,
  type EvidenceStatus,
} from "@/data/thesis/evidence";
import { THESIS_PDF_PATH } from "@/lib/utils";

const statusLabel: Record<EvidenceStatus, string> = {
  direct: "Direct thesis quote",
  derived: "Derived from thesis values",
  provisional: "No thesis source",
};

export function ThesisReference() {
  const [selectedId, setSelectedId] = useState("batch-and-distance");
  const selected = getThesisEvidence(selectedId);
  const pdfPath = selected.page
    ? `${THESIS_PDF_PATH}#page=${selected.page}`
    : THESIS_PDF_PATH;

  useEffect(() => {
    const handleEvidenceSelection = (event: Event) => {
      setSelectedId((event as CustomEvent<string>).detail);
    };
    window.addEventListener(THESIS_EVIDENCE_EVENT, handleEvidenceSelection);
    return () =>
      window.removeEventListener(THESIS_EVIDENCE_EVENT, handleEvidenceSelection);
  }, []);

  return (
    <Card id="thesis-evidence-panel" className="scroll-mt-6">
      <CardHeader>
        <CardTitle>Trace Assumptions to Thesis Evidence</CardTitle>
        <CardDescription>
          Select an assumption to see its exact source passage highlighted. Derived
          and provisional assumptions are labeled when no direct thesis blurb exists.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-md border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Thesis-cited geometry, reference masses, batching, and delivery distance
          are listed below. Midwest prices, regional grid factors, and
          recycled-material sourcing distances are provisional project assumptions
          until authoritative datasets are supplied.
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={THESIS_PDF_PATH}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Open PDF in new tab
          </a>
          <a
            href={THESIS_PDF_PATH}
            download
            className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Download PDF
          </a>
          <a
            href="https://github.com/JamesSotiroff/Second-Cast-Thesis-2026/blob/main/public/docs/ACADIA_2026_Second_Cast.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            View on GitHub
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.2fr)]">
          <div className="space-y-2">
            {THESIS_EVIDENCE.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                aria-pressed={selectedId === item.id}
                className={`w-full rounded-md border p-3 text-left text-sm transition-colors ${
                  selectedId === item.id
                    ? "border-primary bg-primary/5"
                    : "border-border bg-muted/20 hover:bg-muted/50"
                }`}
              >
                <span className="block font-medium">{item.assumption}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {statusLabel[item.status]}
                  {item.page ? ` · PDF page ${item.page}` : ""}
                </span>
              </button>
            ))}
          </div>

          <div
            aria-live="polite"
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {statusLabel[selected.status]}
                </p>
                <h3 className="mt-1 text-lg font-semibold">{selected.assumption}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selected.location}
                </p>
              </div>
              {selected.page ? (
                <a
                  href={pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium underline underline-offset-2"
                >
                  Open PDF page {selected.page}
                </a>
              ) : null}
            </div>

            {selected.highlight ? (
              <blockquote className="mt-5 rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 text-sm leading-7 text-slate-900">
                {selected.before}
                <mark className="rounded bg-amber-300 px-1 font-medium text-slate-950">
                  {selected.highlight}
                </mark>
                {selected.after}
              </blockquote>
            ) : (
              <div className="mt-5 rounded-md border border-dashed border-border bg-muted/30 p-4 text-sm">
                No direct thesis passage supports this assumption.
              </div>
            )}

            <p className="mt-4 text-sm text-muted-foreground">
              {selected.explanation}
            </p>
          </div>
        </div>

        {selected.page ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <iframe
              key={pdfPath}
              src={pdfPath}
              title={`Second Cast thesis evidence: ${selected.assumption}`}
              className="h-[640px] w-full bg-white"
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
            The PDF viewer is hidden for this item because it is a derived or
            application-only assumption without a source page.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
