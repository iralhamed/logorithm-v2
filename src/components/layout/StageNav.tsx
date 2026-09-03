"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const STAGES = [
  { segment: "intake", label: "Intake" },
  { segment: "generate", label: "Generate" },
  { segment: "strategy", label: "Strategy" },
  { segment: "logos", label: "Logos" },
  { segment: "brand", label: "Brand" },
  { segment: "guidelines", label: "Guidelines" },
];

export default function StageNav({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-8 overflow-x-auto">
      {STAGES.map((stage) => {
        const href = `/project/${projectId}/${stage.segment}`;
        const active = pathname === href;
        return (
          <Link
            key={stage.segment}
            href={href}
            className={`whitespace-nowrap border-b-2 pb-4 pt-1 text-sm tracking-wide transition-colors ${
              active
                ? "border-accent text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {stage.label}
          </Link>
        );
      })}
    </nav>
  );
}
