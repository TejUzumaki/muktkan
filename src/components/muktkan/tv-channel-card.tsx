"use client";

import { motion } from "framer-motion";
import { useViewer } from "@/lib/viewer-store";
import { MediaPoster } from "./media-poster";
import { useOnboarding } from "@/lib/store";
import { Radio } from "lucide-react";
import type { TvChannel } from "@/lib/types";

/** Dedicated landscape card for live TV channels — logo-forward, with a live
 * pulse, group chip and hover quick-watch. TV is a landscape medium, so the
 * portrait media-card undersells it. */
export function TvChannelCard({ media, index = 0 }: { media: TvChannel; index?: number }) {
  const openDetails = useViewer((s) => s.openDetails);
  const openPlayer = useViewer((s) => s.openPlayer);
  const recentlyViewed = useOnboarding((s) => s.recentlyViewed);
  const watched = recentlyViewed.some((m) => m.id === media.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative w-[78vw] shrink-0 cursor-pointer sm:w-[300px] lg:w-[330px]"
      onClick={() => openDetails(media)}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl ring-1 ring-white/10 bg-gradient-to-br from-black/40 to-black/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-[var(--brand)]/50 group-hover:brand-glow">
        {/* Channel logo / poster */}
        <div className="absolute inset-0">
          <MediaPoster media={media} className="h-full w-full" rounded="rounded-2xl" />
        </div>
        {/* Scrim for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />

        {/* Live badge */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          Live
        </div>

        {/* Group chip */}
        {media.group && (
          <div className="absolute right-2.5 top-2.5 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur">
            {media.group}
          </div>
        )}

        {/* Channel title strip */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow">{media.title}</p>
            <p className="line-clamp-1 mt-0.5 text-[11px] text-white/70">
              {media.country}{watched ? " · watched" : ""}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openPlayer(media);
            }}
            className="grid h-10 w-10 shrink-0 translate-y-1 place-items-center rounded-full bg-[var(--brand)] text-[var(--brand-foreground)] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:brightness-110"
            aria-label="Watch"
          >
            <Radio className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
