"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewer } from "@/lib/viewer-store";
import { MediaPoster } from "./media-poster";
import { X, Sparkles } from "lucide-react";

/**
 * Full-screen overlay showing all titles in a Collection, in a responsive
 * grid. Each title opens its details panel. The viewer's blurb gives the
 * collection editorial framing.
 */
export function CollectionViewer() {
  const collection = useViewer((s) => s.collection);
  const close = useViewer((s) => s.closeCollection);
  const openDetails = useViewer((s) => s.openDetails);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <AnimatePresence>
      {collection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[55] overflow-y-auto bg-background/85 backdrop-blur-xl"
          onClick={close}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto min-h-screen w-full max-w-7xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header band */}
            <div className="relative overflow-hidden px-4 pt-16 pb-8 sm:px-6 sm:pt-20 sm:pb-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-50"
                style={{
                  background:
                    "radial-gradient(60% 80% at 80% 10%, color-mix(in oklch, var(--brand) 32%, transparent), transparent 60%)",
                }}
              />
              <div className="relative">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 brand-text" />
                  <span>Collection · {collection.era}</span>
                </div>
                <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {collection.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">{collection.subtitle}</p>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
                  {collection.blurb}
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={close}
              className="fixed right-4 top-4 z-[60] grid h-11 w-11 place-items-center rounded-full border border-border bg-card/70 backdrop-blur transition hover:bg-card sm:right-6 sm:top-6"
              aria-label="Close collection"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Titles grid */}
            <div className="relative px-4 pb-16 sm:px-6">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
                {collection.resolve().map((m, i) => (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(i * 0.03, 0.4) }}
                    onClick={() => openDetails(m)}
                    className="group relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-white/10 transition hover:ring-[var(--brand)]/60 hover:brand-glow"
                    aria-label={`Open ${m.title}`}
                  >
                    <MediaPoster media={m} className="h-full w-full" rounded="rounded-xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-90" />
                    <div className="absolute inset-x-0 bottom-0 p-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand)]">
                        {m.kind === "movie" ? "Film" : "Book"}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs font-semibold text-white drop-shadow">
                        {m.title}
                      </p>
                      {m.year && <p className="mt-0.5 text-[10px] text-white/60">{m.year}</p>}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
