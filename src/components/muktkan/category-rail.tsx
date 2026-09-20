"use client";

import { useState, useRef } from "react";
import { MediaCard } from "./media-card";
import { TvChannelCard } from "./tv-channel-card";
import { useShelf } from "@/lib/use-shelf";
import type { MediaKind, TvChannel } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface RailConfig {
  kind: MediaKind;
  title: string;
  subtitle?: string;
  categories: { id: string; label: string }[];
}

export function CategoryRail({ config }: { config: RailConfig }) {
  const [category, setCategory] = useState(config.categories[0]?.id ?? "featured");
  const { items, loading } = useShelf(config.kind, category, 24);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isTv = config.kind === "tv";

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-end gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{config.title}</h2>
            {items.length > 0 && (
              <span className="mb-1 rounded-full bg-[var(--brand)]/12 px-2 py-0.5 text-[11px] font-semibold brand-text tabular-nums">
                {items.length}
              </span>
            )}
          </div>
          {config.subtitle && <p className="text-sm text-muted-foreground">{config.subtitle}</p>}
        </div>
        {/* Category chips */}
        <div className="mt-2 flex max-w-full gap-2 overflow-x-auto pb-1 no-scrollbar premium-scroll">
          {config.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                category === c.id
                  ? "bg-[var(--brand)] text-[var(--brand-foreground)] shadow"
                  : "border border-border bg-card/40 text-muted-foreground hover:bg-card/70 hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
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
          {loading && items.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <CardSkeleton key={i} landscape={isTv} />
              ))
            : items.map((m, i) =>
                isTv ? (
                  <TvChannelCard key={m.id} media={m as TvChannel} index={i} />
                ) : (
                  <MediaCard key={m.id} media={m} index={i} />
                )
              )}
          {!loading && items.length === 0 && (
            <div className="flex h-[280px] w-full items-center justify-center text-sm text-muted-foreground">
              No titles in this shelf right now.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function CardSkeleton({ landscape }: { landscape?: boolean }) {
  if (landscape) {
    return (
      <div className="w-[78vw] shrink-0 sm:w-[300px] lg:w-[330px]">
        <div className="aspect-video overflow-hidden rounded-2xl shimmer" />
        <div className="mt-2.5 h-3 w-2/3 rounded shimmer" />
      </div>
    );
  }
  return (
    <div className="w-[44vw] shrink-0 sm:w-[200px] lg:w-[218px]">
      <div className="aspect-[2/3] overflow-hidden rounded-2xl shimmer" />
      <div className="mt-2.5 h-3 w-3/4 rounded shimmer" />
      <div className="mt-1.5 h-2.5 w-1/2 rounded shimmer" />
    </div>
  );
}
