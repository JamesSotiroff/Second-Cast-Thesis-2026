import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { THESIS_PDF_PATH } from "@/lib/utils";

const citations = [
  {
    parameter: "Batch size (26 panels = 1 flatbed load)",
    figure: "Figure 9",
    page: 8,
  },
  {
    parameter: "Transport distance (150 km one-way)",
    figure: "Figure 9",
    page: 8,
  },
  {
    parameter: "Optimized panel mass (~156 kg)",
    figure: "Figure 7",
    page: 7,
  },
  {
    parameter: "King-stud panel mass (~168 kg)",
    figure: "Figure 8",
    page: 7,
  },
  {
    parameter: "Mass reduction (up to 33%) and embodied carbon (~30%)",
    figure: "Section 4 / Figure 9",
    page: 8,
  },
  {
    parameter: "Foam-crete mix variables and density grading",
    figure: "Figure 3",
    page: 4,
  },
];

export function ThesisReference() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ACADIA 2026 Submission Reference</CardTitle>
        <CardDescription>
          Second Cast: Functionally Graded Composite Walls from Recycled Concrete
          and Foam-Crete. Manufacturing and transportation scope only — operational
          performance is excluded per the submission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="grid gap-3 md:grid-cols-2">
          {citations.map((item) => (
            <div
              key={item.parameter}
              className="rounded-md border border-border bg-muted/30 p-3 text-sm"
            >
              <p className="font-medium">{item.parameter}</p>
              <p className="text-muted-foreground">
                {item.figure} —{" "}
                <a
                  href={`${THESIS_PDF_PATH}#page=${item.page}`}
                  className="underline underline-offset-2"
                >
                  PDF page {item.page}
                </a>
              </p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <iframe
            src={THESIS_PDF_PATH}
            title="Second Cast ACADIA 2026 Submission"
            className="h-[640px] w-full bg-white"
          />
        </div>
      </CardContent>
    </Card>
  );
}
