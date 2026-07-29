"use client";

export const THESIS_EVIDENCE_EVENT = "second-cast:select-thesis-evidence";

export function ThesisEvidenceLink({
  evidenceId,
  children,
}: {
  evidenceId: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent(THESIS_EVIDENCE_EVENT, { detail: evidenceId }),
    );
    document
      .getElementById("thesis-evidence-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="text-xs font-medium text-primary underline underline-offset-2"
    >
      {children}
    </button>
  );
}
