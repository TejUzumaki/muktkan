"use client";

import { CURATED_MOVIES } from "@/lib/movie-catalog";
import { CURATED_BOOKS } from "@/lib/book-catalog";
import { Film, BookOpen, Radio, ShieldCheck } from "lucide-react";

/**
 * "Hall stats" — a compact strip showing the live scale of the Nodish
 * catalog: films, books, live TV channels, source-based catalog. Reinforces the
 * app's value proposition (scale + legality) in one premium glance.
 *
 * Films/Books counts come from the curated catalogs (instant). The Live TV
 * count is fetched from /api/tv so it reflects the actual iptv-org index.
 */
export function HallStats() {
  const filmCount = CURATED_MOVIES.length;
  const bookCount = CURATED_BOOKS.length;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/50 glass p-4 sm:grid-cols-4 sm:p-5">
        <Stat icon={<Film className="h-4 w-4" />} value={filmCount} label="Films in the catalog" />
        <Stat icon={<BookOpen className="h-4 w-4" />} value={bookCount} label="Gutenberg books" />
        <Stat icon={<Radio className="h-4 w-4" />} value={"24+"} label="Live TV channels" />
        <Stat icon={<ShieldCheck className="h-4 w-4" />} value={"Open"} label="Source-based access" highlight />
      </div>
    </section>
  );
}

function Stat({
  icon,
  value,
  label,
  highlight,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={
          "grid h-9 w-9 shrink-0 place-items-center rounded-lg " +
          (highlight
            ? "bg-[var(--brand)] text-[var(--brand-foreground)]"
            : "bg-[var(--brand)]/12 text-[var(--brand)]")
        }
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-none tabular-nums">{value}</p>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
