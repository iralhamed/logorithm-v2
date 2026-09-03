import { listProjects, getProjectStatus, describeStage, defaultRouteFor } from "@/core/persistence";
import { createProjectAction } from "@/app/actions";
import ProjectCard from "@/components/studio/ProjectCard";
import Button from "@/components/ui/Button";

export default async function StudioPage() {
  const projects = await listProjects();
  const rows = await Promise.all(
    projects.map(async (project) => {
      const status = await getProjectStatus(project.id);
      return {
        project,
        stage: describeStage(status),
        href: defaultRouteFor(project.id, status),
      };
    })
  );

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-16 sm:px-10">
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-4xl tracking-tight text-foreground sm:text-5xl">Studio</h1>
        <p className="text-base text-muted">Every brand project in progress, in one place.</p>
      </div>

      <form action={createProjectAction}>
        <button
          type="submit"
          className="flex w-full items-center justify-center border border-dashed border-border px-8 py-10 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          New Brand Project
        </button>
      </form>

      {rows.length > 0 ? (
        <ul className="flex flex-col">
          {rows.map(({ project, stage, href }) => (
            <ProjectCard key={project.id} project={project} stage={stage} href={href} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-4 border border-border px-8 py-12">
          <p className="text-sm text-muted">No brand projects yet.</p>
          <Button href="/" variant="secondary">
            Back to home
          </Button>
        </div>
      )}
    </main>
  );
}
