export default function GuidelineSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-8 border-t border-border py-16 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-6">
        <span className="font-mono text-sm text-muted-2">{String(index).padStart(2, "0")}</span>
        <h2 className="font-serif text-3xl tracking-tight text-foreground sm:text-4xl">{title}</h2>
      </div>
      <div className="max-w-3xl">{children}</div>
    </section>
  );
}
