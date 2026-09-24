"use client";

import { motion } from "framer-motion";
import { useViewer } from "@/lib/viewer-store";
import { useOnboarding } from "@/lib/store";
import { Radio } from "lucide-react";
import type { TvChannel } from "@/lib/types";

function ChannelFallback({ title }: { title: string }) {
  const initial =
    title
      .replace(/^The\s+|^A\s+|^An\s+/i, "")
      .trim()
      .charAt(0)
      .toUpperCase() || "T";

  return (
    <div className="absolute inset-0 grid place-items-center bg-black">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/5 text-3xl font-semibold text-white/75">
        {initial}
      </div>
    </div>
  );
}

export function TvChannelCard({
  media,
  index = 0,
}: {
  media: TvChannel;
  index?: number;
}) {
  const openTv = useViewer((s) => s.openTv);
  const recentlyViewed = useOnboarding((s) => s.recentlyViewed);
  const watched = recentlyViewed.some((m) => m.id === media.id);

  const imageSrc = media.logo || media.poster || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative w-[78vw] shrink-0 cursor-pointer sm:w-[300px] lg:w-[330px]"
      onClick={() => openTv(media)}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-[var(--brand)]/50 group-hover:brand-glow">
        <div className="absolute inset-0">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={media.title}
              loading="lazy"
              draggable={false}
              className="h-full w-full object-contain bg-black p-5"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <ChannelFallback title={media.title} />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/20" />

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 rounded-full bg-red-600/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          Live
        </div>

        {media.group && (
          <div className="absolute right-2.5 top-2.5 max-w-[55%] truncate rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white/90 backdrop-blur">
            {media.group}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-white drop-shadow">
              {media.title}
            </p>

            <p className="mt-0.5 line-clamp-1 text-[11px] text-white/70">
              {media.country || "Live TV"}
              {watched ? " · watched" : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openTv(media);
            }}
            className="grid h-10 w-10 shrink-0 translate-y-1 place-items-center rounded-full bg-[var(--brand)] text-[var(--brand-foreground)] opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hover:brightness-110"
            aria-label={`Watch ${media.title}`}
          >
            <Radio className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
