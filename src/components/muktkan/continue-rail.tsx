"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/lib/store";
import { useViewer } from "@/lib/viewer-store";
import { MediaPoster } from "./media-poster";
import { History, ChevronLeft, ChevronRight, X, Play, BookOpen, Radio } from "lucide-react";
import type { Media } from "@/lib/types";
import { cn } from "@/lib/utils";

/** "Continue exploring" — the user's recently-opened titles, newest first.
 * Persisted in the onboarding store so it survives reloads. */
export function ContinueRail() {
  const recentlyViewed = useOnboarding((s) => s.recentlyViewed);
  const clear = useOnboarding((s) => s.clearRecentlyViewed);
  const openDetails = useViewer((s) => s.openDetails);
  const openPlayer = useViewer((s) => s.openPlayer);
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (recentlyViewed.length === 0) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 brand-text" />
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Continue exploring</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {recentlyViewed.length} title{recentlyViewed.length === 1 ? "" : "s"} you've opened
            </p>
          </div>
          <button
            onClick={clear}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-card/70 hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>

      <div className="group/rail relative mt-4">
        <button
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/70 p-2 backdrop-blur transition hover:bg-card sm:flex sm:opacity-0 sm:group-hover/rail:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/70 p-2 backdrop-blur transition hover:bg-card sm:flex sm:opacity-0 sm:group-hover/rail:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div
          ref={scrollerRef}
          className="premium-scroll mask-fade-edges flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6"
        >
          {recentlyViewed.map((m, i) => (
            <ContinueCard key={m.id} media={m} index={i} onOpen={() => openDetails(m)} onPlay={() => openPlayer(m)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContinueCard({
  media,
  index,
  onOpen,
  onPlay,
}: {
  media: Media;
  index: number;
  onOpen: () => void;
  onPlay: () => void;
}) {
  const isTv = media.kind === "tv";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.25) }}
      className={cn(
        "group relative shrink-0 cursor-pointer",
        isTv ? "w-[78vw] sm:w-[300px] lg:w-[330px]" : "w-[44vw] sm:w-[200px] lg:w-[218px]"
      )}
      onClick={onOpen}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-[var(--brand)]/50 group-hover:brand-glow",
          isTv ? "aspect-video" : "aspect-[2/3]"
        )}
      >
        <MediaPoster media={media} className="h-full w-full" rounded="rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        {/* "Continue" pill */}
        <div className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)]/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-foreground)] shadow">
          {media.kind === "movie" ? <Play className="h-2.5 w-2.5 fill-current" /> : media.kind === "book" ? <BookOpen className="h-2.5 w-2.5" /> : <Radio className="h-2.5 w-2.5" />}
          {media.kind === "movie" ? "Watch" : media.kind === "book" ? "Read on" : "Tune in"}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow">{media.title}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">{media.meta?.[0]}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-1.5 place-items-center rounded-full bg-[var(--brand)] text-[var(--brand-foreground)] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:brightness-110"
          aria-label={media.kind === "movie" ? "Play" : media.kind === "book" ? "Read" : "Watch"}
        >
          {media.kind === "movie" ? <Play className="h-4 w-4 fill-current" /> : media.kind === "book" ? <BookOpen className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
        </button>
      </div>
    </motion.div>
  );
}
