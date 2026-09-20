"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { noteForDay } from "@/lib/curator-notes";
import { Feather } from "lucide-react";

/**
 * "Curator's note" — a small editorial essay that gives the Hall a voice.
 * Deterministically chosen by day-of-year so each day has a stable note.
 * Premium magazine pull-quote styling.
 */
export function CuratorNoteRail() {
  const note = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000
    );
    return noteForDay(dayOfYear);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <motion.figure
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-border/50"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklch, var(--card) 90%, transparent) 0%, color-mix(in oklch, var(--card) 60%, transparent) 100%)",
        }}
      >
        {/* Decorative oversized quote mark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-8 -right-2 select-none font-serif text-[10rem] leading-none brand-text opacity-15 sm:text-[14rem]"
        >
          ”
        </span>

        <div className="relative grid gap-5 p-6 sm:grid-cols-[auto,1fr] sm:gap-8 sm:p-8 lg:p-10">
          <div className="flex items-start gap-3 sm:flex-col sm:items-start">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-[var(--brand-foreground)] shadow-lg"
              style={{ background: "var(--brand)" }}
            >
              <Feather className="h-5 w-5" />
            </span>
            <div className="sm:mt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] brand-text">
                Curator&apos;s note
              </p>
              <p className="text-[11px] text-muted-foreground">From the Hall</p>
            </div>
          </div>

          <blockquote className="relative">
            <h3 className="text-balance text-lg font-semibold leading-snug tracking-tight sm:text-xl">
              {note.title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {note.body}
            </p>
            <figcaption className="mt-4 text-sm font-medium text-foreground/80">
              — {note.signoff}
            </figcaption>
          </blockquote>
        </div>
      </motion.figure>
    </section>
  );
}
