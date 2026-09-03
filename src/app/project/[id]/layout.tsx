import { notFound } from "next/navigation";
import { getProjectMeta } from "@/core/persistence";
import StageNav from "@/components/layout/StageNav";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectMeta(id);
  if (!project) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pt-10 sm:px-10">
          <span className="font-serif text-2xl tracking-tight text-foreground">{project.name}</span>
          <StageNav projectId={id} />
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-16 sm:px-10">{children}</div>
    </div>
  );
}
