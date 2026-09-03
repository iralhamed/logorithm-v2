import Button from "@/components/ui/Button";
import { createProjectAction } from "@/app/actions";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24 sm:px-10">
      <div className="flex w-full max-w-2xl flex-col items-start gap-10">
        <h1 className="font-serif text-6xl italic tracking-tight text-foreground sm:text-7xl">
          Logorithm
        </h1>
        <p className="max-w-lg text-lg leading-relaxed text-muted">
          A considered approach to brand-building — from first principles to a
          finished identity, guided rather than automated.
        </p>
        <div className="flex flex-col gap-4 pt-4 sm:flex-row">
          <form action={createProjectAction}>
            <Button type="submit" variant="primary">
              Create Brand
            </Button>
          </form>
          <Button href="/studio" variant="secondary">
            Open Studio
          </Button>
        </div>
      </div>
    </main>
  );
}
