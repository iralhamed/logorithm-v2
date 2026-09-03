"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

export type PhaseStatus = "pending" | "active" | "done" | "skipped" | "error";

export interface PhaseState {
  stage: string;
  label: string;
  status: PhaseStatus;
}

const PHASES: { stage: string; label: string }[] = [
  { stage: "evaluate", label: "Understanding your brand" },
  { stage: "strategy", label: "Building strategy" },
  { stage: "creative", label: "Creating creative direction" },
  { stage: "brandSystem", label: "Building brand system" },
  { stage: "logos", label: "Designing three logo routes" },
];

const UPSTREAM_STAGES = ["evaluate", "strategy", "creative", "brandSystem"];

type Scope = "all" | "logos";

interface StreamEvent {
  stage: string;
  label: string;
  status: "start" | "done" | "skipped" | "error";
  message?: string;
}

export default function GenerateRunner({
  projectId,
  initialDone,
}: {
  projectId: string;
  /** Which of the 5 phases already have valid saved output — drives the initial,
   * pre-click display so a finished project never looks like it needs re-running. */
  initialDone: Record<string, boolean>;
}) {
  const [phases, setPhases] = useState<PhaseState[]>(
    PHASES.map((p) => ({ ...p, status: initialDone[p.stage] ? "done" : "pending" }))
  );
  const [running, setRunning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [finished, setFinished] = useState(PHASES.every((p) => initialDone[p.stage]));

  const upstreamReady = UPSTREAM_STAGES.every((s) => initialDone[s]);
  const anyUpstreamDone = UPSTREAM_STAGES.some((s) => initialDone[s]);
  // Strategy + creative direction + brand system exist, but logos are missing or
  // no longer valid: offer a logo-only run that touches none of the upstream work.
  const canGenerateLogosOnly = upstreamReady && !initialDone.logos;

  function applyEvent(event: StreamEvent) {
    if (event.stage === "complete" && event.status === "done") {
      setFinished(true);
      return;
    }
    if (event.status === "error") {
      setErrorMessage(event.message ?? "Generation failed.");
      return;
    }
    setPhases((prev) =>
      prev.map((p) =>
        p.stage === event.stage
          ? { ...p, status: event.status === "start" ? "active" : (event.status as PhaseStatus) }
          : p
      )
    );
  }

  async function run({ force = false, scope = "all" as Scope }: { force?: boolean; scope?: Scope }) {
    if (force) {
      const confirmed = window.confirm(
        "This regenerates the full brand system — strategy, creative direction, brand system, and logo directions — and replaces the current versions. Continue?"
      );
      if (!confirmed) return;
    }

    setRunning(true);
    setErrorMessage(null);
    setFinished(false);
    setPhases(
      PHASES.map((p) => {
        // In a logos-only run the upstream phases are loaded, never regenerated —
        // show them as already done rather than pending.
        if (scope === "logos" && p.stage !== "logos") {
          return { ...p, status: initialDone[p.stage] ? "done" : "pending" };
        }
        return { ...p, status: "pending" };
      })
    );

    try {
      const res = await fetch(`/api/projects/${projectId}/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ force, scope }),
      });

      if (!res.ok || !res.body) {
        throw new Error("The server did not start generation. Please try again.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          applyEvent(JSON.parse(line) as StreamEvent);
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Generation failed unexpectedly.");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-10">
      <ol className="flex flex-col gap-4">
        {phases.map((phase) => (
          <li key={phase.stage} className="flex items-center gap-4">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                phase.status === "done" || phase.status === "skipped"
                  ? "bg-accent"
                  : phase.status === "active"
                    ? "animate-pulse bg-accent"
                    : phase.status === "error"
                      ? "bg-red-600"
                      : "bg-border"
              }`}
            />
            <span className={`text-base ${phase.status === "pending" ? "text-muted-2" : "text-foreground"}`}>
              {phase.label}
            </span>
            {phase.status === "skipped" && <span className="text-xs text-muted-2">already generated</span>}
          </li>
        ))}
      </ol>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex flex-wrap items-center gap-6 border-t border-border pt-8">
        {!finished && !running && canGenerateLogosOnly && (
          <Button variant="primary" onClick={() => run({ scope: "logos" })}>
            Generate Logo Directions
          </Button>
        )}

        {!finished && !running && !canGenerateLogosOnly && (
          <Button variant="primary" onClick={() => run({ scope: "all" })}>
            {anyUpstreamDone ? "Resume Generation" : "Generate Brand"}
          </Button>
        )}

        {!finished && running && (
          <Button variant="primary" disabled>
            Generating…
          </Button>
        )}

        {finished && (
          <Button variant="primary" href={`/project/${projectId}/strategy`}>
            Continue to Strategy
          </Button>
        )}

        {upstreamReady && !running && (
          <Button variant="ghost" onClick={() => run({ force: true, scope: "all" })}>
            Regenerate full brand system
          </Button>
        )}
      </div>
    </div>
  );
}
