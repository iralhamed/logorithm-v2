import Link from "next/link";

export default function Wordmark({
  size = "sm",
  href = "/",
}: {
  size?: "sm" | "lg";
  href?: string | null;
}) {
  const label = (
    <span
      className={
        size === "lg"
          ? "font-serif text-5xl tracking-tight sm:text-6xl"
          : "font-serif text-lg tracking-tight"
      }
    >
      Logorithm
    </span>
  );

  if (!href) return label;

  return (
    <Link href={href} className="inline-flex items-center">
      {label}
    </Link>
  );
}
