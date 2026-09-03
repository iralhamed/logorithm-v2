import type { IntakeStep } from "@/types/intake";

export default function StepProgress({
  steps,
  currentIndex,
}: {
  steps: IntakeStep[];
  currentIndex: number;
}) {
  return (
    <ol className="flex w-full items-start gap-2 sm:gap-4">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.id} className="flex flex-1 flex-col gap-3">
            <span
              className={`block h-[2px] w-full rounded-full transition-colors ${
                isComplete || isCurrent ? "bg-accent" : "bg-border"
              }`}
            />
            <div className="flex flex-col gap-0.5">
              <span
                className={`text-xs tracking-wide ${
                  isCurrent ? "text-foreground" : "text-muted-2"
                }`}
              >
                {String(step.number).padStart(2, "0")}
              </span>
              <span
                className={`hidden text-sm sm:block ${
                  isCurrent ? "text-foreground" : "text-muted-2"
                }`}
              >
                {step.title}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
