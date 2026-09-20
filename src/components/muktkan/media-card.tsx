"use client";

import { motion } from "framer-motion";
import { useViewer } from "@/lib/viewer-store";
import { MediaPoster } from "./media-poster";
import type { Media } from "@/lib/types";
import { Play, BookOpen, Radio, Star } from "lucide-react";

/**
 * Rail card with a premium hover-detail overlay: when the user hovers, an
 * elevated info card rises above the poster showing the title, year, creator,
 * a short synopsis, and a quick-play + details cluster — a Netflix-style
 * "expanding card" that previews without requiring a click.
 */
export function MediaCard({ media, index = 0 }: { media: Media; index?: number }) {
  const openDetails = useViewer((s) => s.openDetails);
  const openPlayer = useViewer((s) => s.openPlayer);
  const isMovie = media.kind === "movie";
  const isBook = media.kind === "book";
  const kindIcon = isMovie ? <Play className="h-3.5 w-3.5 fill-current" /> : isBook ? <BookOpen className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" />;
  const kindLabel = isMovie ? "Film" : isBook ? "Book" : "Live";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative w-[44vw] shrink-0 cursor-pointer sm:w-[200px] lg:w-[218px]"
      onClick={() => openDetails(media)}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:ring-[var(--brand)]/50 group-hover:brand-glow">
        <MediaPoster media={media} className="h-full w-full" rounded="rounded-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

        {/* Kind chip */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          {kindIcon}
          {kindLabel}
        </div>

        {/* Bottom title (always visible) */}
        <div className="absolute inset-x-0 bottom-0 p-3 transition-opacity duration-200 group-hover:opacity-0">
          <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow">{media.title}</p>
          <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">{media.meta?.[0]}</p>
        </div>

        {/* Hover detail overlay — premium expanding card */}
        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <p className="line-clamp-1 text-sm font-bold text-white drop-shadow">{media.title}</p>
          {media.creator && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">
              {isBook ? "by" : "directed by"} {media.creator}
              {media.year ? ` · ${media.year}` : ""}
            </p>
          )}
          <p className="mt-1.5 line-clamp-3 text-[11px] leading-relaxed text-white/80">
            {media.description}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openPlayer(media);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-3 py-1.5 text-[11px] font-semibold text-[var(--brand-foreground)] shadow transition hover:brightness-110"
              aria-label={isMovie ? "Play" : isBook ? "Read" : "Watch"}
            >
              {isMovie ? <Play className="h-3 w-3 fill-current" /> : isBook ? <BookOpen className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
              {isMovie ? "Play" : isBook ? "Read" : "Watch"}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDetails(media);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Details"
            >
              <Star className="h-3 w-3" /> More
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
