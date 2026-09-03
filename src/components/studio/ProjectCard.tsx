import Link from "next/link";
import type { ProjectMeta } from "@/core/persistence";

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function ProjectCard({
  project,
  stage,
  href,
}: {
  project: ProjectMeta;
  stage: string;
  href: string;
}) {
  return (
    <li className="flex items-center justify-between gap-6 border-b border-border py-6">
      <div className="flex flex-col gap-1">
        <span className="text-lg text-foreground">{project.name}</span>
        <span className="text-sm text-muted">
          {stage} · Edited {formatUpdatedAt(project.updatedAt)}
        </span>
      </div>
      <Link
        href={href}
        className="shrink-0 border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        Open
      </Link>
    </li>
  );
}
