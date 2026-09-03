import Link from "next/link";
import Wordmark from "@/components/ui/Wordmark";

export default function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 sm:px-10">
        <Wordmark size="sm" />
        <nav className="flex items-center gap-8 text-sm text-muted">
          <Link href="/studio" className="transition-colors hover:text-foreground">
            Studio
          </Link>
        </nav>
      </div>
    </header>
  );
}
