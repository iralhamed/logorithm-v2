export default function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-8">
      <span className="text-xs uppercase tracking-wide text-muted-2">{label}</span>
      {children}
    </div>
  );
}
