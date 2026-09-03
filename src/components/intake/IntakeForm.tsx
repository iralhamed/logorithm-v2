"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/Button";
import StepProgress from "@/components/intake/StepProgress";
import { intakeSteps } from "@/lib/intake-steps";
import type { IntakeField, IntakeValues } from "@/types/intake";

function Field({
  field,
  value,
  onChange,
}: {
  field: IntakeField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.type === "textarea") {
    return (
      <textarea
        id={field.id}
        rows={3}
        dir="auto"
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none border-b border-border bg-transparent py-3 text-base text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
      />
    );
  }

  if (field.type === "choice") {
    return (
      <div className="flex flex-col divide-y divide-border border-b border-border">
        {field.options?.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className="flex items-center gap-3 py-3 text-left text-base transition-colors"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full border transition-colors ${
                  selected ? "border-accent bg-accent" : "border-border bg-transparent"
                }`}
              />
              <span className={selected ? "text-foreground" : "text-muted"}>{option}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <input
      id={field.id}
      type="text"
      dir="auto"
      value={value}
      placeholder={field.placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border-b border-border bg-transparent py-3 text-base text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none"
    />
  );
}

export default function IntakeForm({
  action,
}: {
  /** Server action bound to this project's id — see `[id]/actions.ts`. */
  action: (formData: FormData) => Promise<void>;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<IntakeValues>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const step = intakeSteps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === intakeSteps.length - 1;
  const visibleFields = step.fields.filter(
    (field) => !field.showWhen || values[field.showWhen.fieldId] === field.showWhen.equals
  );
  const canAdvance = visibleFields.every((field) => !field.required || values[field.id]?.trim());

  function setFieldValue(id: string, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  function handleSubmit() {
    setError(null);
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      formData.set(key, value);
    }
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong saving your intake. Please try again."
        );
      }
    });
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-16">
      <StepProgress steps={intakeSteps} currentIndex={stepIndex} />

      <div className="flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">{step.title}</h1>
          <p className="text-base text-muted">{step.description}</p>
        </div>

        <div className="flex flex-col gap-10">
          {visibleFields.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <label htmlFor={field.id} className="text-sm text-foreground">
                {field.label}
                {field.required && <span className="text-muted-2"> *</span>}
              </label>
              <Field
                field={field}
                value={values[field.id] ?? ""}
                onChange={(value) => setFieldValue(field.id, value)}
              />
              {field.helper && <span className="text-xs text-muted-2">{field.helper}</span>}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between border-t border-border pt-8">
        <button
          type="button"
          onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
          className="text-sm text-muted transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
        >
          Back
        </button>

        {isLast ? (
          <Button variant="primary" disabled={!canAdvance || isPending} onClick={handleSubmit}>
            {isPending ? "Saving…" : "Continue to Generate"}
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={!canAdvance}
            onClick={() => setStepIndex((i) => Math.min(intakeSteps.length - 1, i + 1))}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  );
}
