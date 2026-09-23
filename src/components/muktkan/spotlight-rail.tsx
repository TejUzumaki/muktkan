"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useShelf } from "@/lib/use-shelf";
import { useViewer } from "@/lib/viewer-store";
import { useOnboarding } from "@/lib/store";
import { MediaPoster } from "./media-poster";
import { Sparkles, Play, BookOpen, Radio, ArrowUpRight } from "lucide-react";
import type { Media } from "@/lib/types";

/**
 * "Tonight in the Hall" — a single editorial spotlight pick of the day,
 * deterministically chosen from the catalog so it's stable per day per user.
 * Premium magazine-style framing that elevates a single selected work.
 */
export function SpotlightRail() {
  const movies = useShelf("movie", "featured", 8);
  const books = useShelf("book", "popular", 8);
  const openDetails = useViewer((s) => s.openDetails);
  const openPlayer = useViewer((s) => s.openPlayer);
  const favorites = useOnboarding((s) => s.favorites);
  const isFav = (id: string) => favorites.some((f) => f.id === id);

  // Deterministic "pick of the day" — combines catalog with the day-of-year
  // and a user-specific salt (avatar seed) so it changes daily + per-user.
  const spotlight = useMemo(() => {
    const pool: Media[] = [...movies.items, ...books.items];
    if (pool.length === 0) return null;
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
    );
    const salt = (useOnboarding.getState().profile.avatarSeed || 1) * 7;
    const idx = (dayOfYear + salt) % pool.length;
    return pool[idx];
  }, [movies.items, books.items]);

  if (!spotlight) return null;

  const isMovie = spotlight.kind === "movie";
  const isBook = spotlight.kind === "book";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border/60 glass-strong"
      >
        {/* Ambient branded backdrop */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(60% 80% at 85% 20%, color-mix(in oklch, var(--brand) 35%, transparent), transparent 60%), radial-gradient(50% 60% at 10% 90%, color-mix(in oklch, var(--brand) 22%, transparent), transparent 65%)",
          }}
        />
        <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.12]" />

        <div className="relative grid gap-6 p-6 sm:grid-cols-[auto,1fr] sm:gap-8 sm:p-8">
          {/* Poster */}
          <button
            onClick={() => openDetails(spotlight)}
            className="group relative mx-auto aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 transition hover:ring-[var(--brand)]/60 hover:brand-glow sm:mx-0 sm:w-44"
            aria-label={`Open ${spotlight.title}`}
          >
            <MediaPoster media={spotlight} className="h-full w-full" rounded="rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100" />
          </button>

          {/* Editorial copy */}
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 brand-text" />
              <span>Tonight in the Hall</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
              <span>{today}</span>
            </div>

            <h2 className="mt-3 text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              {spotlight.title}
            </h2>
            {spotlight.creator && (
              <p className="mt-1 text-sm text-muted-foreground">
                {isBook ? "by" : "directed by"}{" "}
                <span className="text-foreground/80">{spotlight.creator}</span>
                {spotlight.year ? ` · ${spotlight.year}` : ""}
              </p>
            )}

            <p className="mt-3 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              {spotlight.description}
            </p>

            {/* Tags */}
            {spotlight.meta && spotlight.meta.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {spotlight.meta.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-card/40 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
                {isFav(spotlight.id) && (
                  <span className="rounded-full bg-[var(--brand)]/15 px-2.5 py-0.5 text-[11px] font-medium brand-text">
                    In your library
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openPlayer(spotlight)}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-[var(--brand-foreground)] shadow-lg transition hover:brightness-110"
              >
                {isMovie ? <Play className="h-4 w-4 fill-current" /> : isBook ? <BookOpen className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
                {isMovie ? "Play now" : isBook ? "Start reading" : "Tune in"}
              </button>
              <button
                onClick={() => openDetails(spotlight)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-4 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-card/80"
              >
                More <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
