"use client";

import { motion } from "framer-motion";
import { COLLECTIONS } from "@/lib/collections";
import { useViewer } from "@/lib/viewer-store";
import { MediaPoster } from "./media-poster";
import { Library, ArrowUpRight } from "lucide-react";

/**
 * "Collections" — a MUBI-style row of curated themed groupings. Each card
 * previews 3 stacked posters from the collection, shows its title/subtitle/
 * count, and opens the full-screen CollectionViewer on click.
 */
export function CollectionsRail() {
  const openCollection = useViewer((s) => s.openCollection);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-4 flex items-center gap-2">
        <Library className="h-5 w-5 brand-text" />
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Collections</h2>
          <p className="text-sm text-muted-foreground">Themed shelves, curated by the Hall</p>
        </div>
      </div>

      <div className="premium-scroll mask-fade-edges flex gap-4 overflow-x-auto pb-2">
        {COLLECTIONS.map((c, i) => {
          const items = c.resolve();
          const preview = items.slice(0, 3);
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
              onClick={() => openCollection(c)}
              className="group relative flex w-[80vw] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-border/60 glass p-5 text-left sm:w-[320px]"
            >
              {/* Ambient brand glow */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                style={{ background: "var(--brand)" }}
              />

              {/* Stacked poster preview */}
              <div className="relative mb-4 flex h-28 items-end">
                {preview.map((m, idx) => (
                  <div
                    key={m.id}
                    className="absolute aspect-[2/3] w-16 overflow-hidden rounded-lg ring-1 ring-white/10 transition-transform group-hover:scale-105 sm:w-20"
                    style={{
                      left: `calc(${idx * 38}% + 4px)`,
                      zIndex: 10 - idx,
                      transform: `translateY(${idx % 2 ? 8 : 0}px) rotate(${(idx - 1) * 4}deg)`,
                    }}
                  >
                    <MediaPoster media={m} className="h-full w-full" rounded="rounded-lg" />
                  </div>
                ))}
                <div className="ml-auto flex flex-col items-end">
                  <span className="rounded-full bg-[var(--brand)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--brand-foreground)]">
                    {items.length} titles
                  </span>
                </div>
              </div>

              <div className="relative">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] brand-text">
                  {c.era}
                </p>
                <h3 className="mt-1 text-balance text-lg font-semibold leading-tight tracking-tight">
                  {c.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition group-hover:text-foreground">
                  Explore collection <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
