"use client";

import { Play, BookOpen, Radio, Heart, Share2 } from "lucide-react";
import { useViewer } from "@/lib/viewer-store";
import { useOnboarding } from "@/lib/store";
import { useToast } from "./toast";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/types";

export function MediaActions({
  media,
  variant = "default",
}: {
  media: Media;
  variant?: "default" | "hero" | "fab";
}) {
  const openPlayer = useViewer((s) => s.openPlayer);
  const openDetails = useViewer((s) => s.openDetails);
  const favorites = useOnboarding((s) => s.favorites);
  const toggleFavorite = useOnboarding((s) => s.toggleFavorite);
  const pushToast = useToast((s) => s.push);
  const isFav = favorites.some((f) => f.id === media.id);

  const primary = getPrimary(media);
  const hero = variant === "hero";
  const fab = variant === "fab";

  const handleFavorite = () => {
    toggleFavorite(media);
    pushToast(
      isFav ? "unfavorite" : "favorite",
      isFav ? `Removed “${media.title}” from your library` : `Added “${media.title}” to your library`
    );
  };

  return (
    <div className={cn("flex items-center gap-2", fab && "flex-col")}>
      <button
        onClick={() => openPlayer(media)}
        className={cn(
          "inline-flex items-center gap-2 rounded-full font-semibold shadow-lg transition hover:brightness-110",
          hero ? "bg-[var(--brand)] px-7 py-3.5 text-[15px] text-[var(--brand-foreground)]" : "bg-[var(--brand)] px-5 py-2.5 text-sm text-[var(--brand-foreground)]",
          fab && "h-14 w-14 flex-col justify-center p-0"
        )}
      >
        {primary.icon}
        <span className={cn(fab && "text-[10px] font-medium")}>{primary.label}</span>
      </button>

      {!fab && (
        <>
          <button
            onClick={() => openDetails(media)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-5 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-card/80"
          >
            More info
          </button>
          <button
            onClick={handleFavorite}
            aria-label={isFav ? "Remove from library" : "Add to library"}
            className={cn(
              "grid place-items-center rounded-full border border-border bg-card/50 backdrop-blur transition hover:bg-card/80",
              hero ? "h-12 w-12" : "h-10 w-10"
            )}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-[var(--brand)] text-[var(--brand)]")} />
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: media.title, text: media.description }).catch(() => {});
              }
            }}
            aria-label="Share"
            className={cn(
              "grid place-items-center rounded-full border border-border bg-card/50 backdrop-blur transition hover:bg-card/80",
              hero ? "h-12 w-12" : "h-10 w-10"
            )}
          >
            <Share2 className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function getPrimary(m: Media): { label: string; icon: React.ReactNode } {
  if (m.kind === "movie") return { label: "Play", icon: <Play className="h-4 w-4 fill-current" /> };
  if (m.kind === "book") return { label: "Read", icon: <BookOpen className="h-4 w-4" /> };
  return { label: "Watch", icon: <Radio className="h-4 w-4" /> };
}
