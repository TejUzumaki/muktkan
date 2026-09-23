"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewer } from "@/lib/viewer-store";
import { MediaPoster } from "./media-poster";
import { MediaActions } from "./media-actions";
import { cn } from "@/lib/utils";
import { X, Play, BookOpen, Radio, Heart, Share2, Clock, Globe, Tag, Sparkles, BookmarkCheck } from "lucide-react";
import { useOnboarding } from "@/lib/store";
import { useToast } from "./toast";
import { CURATED_MOVIES, curatedToMedia } from "@/lib/movie-catalog";
import { CURATED_BOOKS, curatedBookToMedia } from "@/lib/book-catalog";
import type { Media } from "@/lib/types";

export function DetailsPanel() {
  const details = useViewer((s) => s.details);
  const close = useViewer((s) => s.closeDetails);
  const openPlayer = useViewer((s) => s.openPlayer);
  const favorites = useOnboarding((s) => s.favorites);
  const toggleFavorite = useOnboarding((s) => s.toggleFavorite);
  const pushToast = useToast((s) => s.push);
  const readingProgress = useOnboarding((s) =>
    details ? s.readingProgress[details.id] ?? 0 : 0
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <AnimatePresence>
      {details && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-40 overflow-y-auto bg-background/85 backdrop-blur-xl"
          onClick={close}
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto min-h-screen w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hero backdrop */}
            <div className="relative h-[46vh] min-h-[320px] w-full overflow-hidden sm:h-[52vh]">
              <img
                src={details.backdrop || details.poster}
                alt=""
                className="h-full w-full scale-105 object-cover blur-[2px]"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.opacity = "0")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />
              <div
                className="absolute inset-0 opacity-50 mix-blend-soft-light"
                style={{
                  background:
                    "radial-gradient(60% 70% at 70% 30%, color-mix(in oklch, var(--brand) 70%, transparent), transparent 70%)",
                }}
              />
            </div>

            {/* Close button (top) */}
            <button
              onClick={close}
              className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-border bg-card/70 backdrop-blur transition hover:bg-card sm:right-6 sm:top-6"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content body */}
            <div className="relative z-10 -mt-32 px-4 pb-48 sm:-mt-40 sm:px-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
                {/* Poster */}
                <div className="w-36 shrink-0 sm:w-52">
                  <div className="aspect-[2/3] overflow-hidden rounded-2xl ring-1 ring-white/10 brand-glow">
                    <MediaPoster media={details} className="h-full w-full" rounded="rounded-2xl" />
                  </div>
                </div>

                {/* Meta */}
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="brand-text">{kindLabel(details.kind)}</span>
                    {details.year && (
                      <>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                        <span>{details.year}</span>
                      </>
                    )}
                  </div>
                  <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                    {details.title}
                  </h1>
                  {details.creator && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {details.kind === "book" ? "by" : "directed by"}{" "}
                      <span className="text-foreground/80">{details.creator}</span>
                    </p>
                  )}

                  {/* Mobile actions */}
                  <div className="mt-5 sm:hidden">
                    <MediaActions media={details} variant="hero" />
                  </div>

                  {/* Stat row */}
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {details.year && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {details.year}
                      </span>
                    )}
                    {(details as any).country && (
                      <span className="inline-flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" /> {(details as any).country}
                      </span>
                    )}
                    {(details as any).downloads != null && (
                      <span className="inline-flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" /> {(details as any).downloads.toLocaleString()} reads
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" /> {sourceLabel(details.kind)}
                    </span>
                    {/* Reading progress for books with saved position */}
                    {details.kind === "book" && readingProgress > 0.02 && readingProgress < 0.99 && (
                      <span className="inline-flex items-center gap-1.5 brand-text">
                        <BookmarkCheck className="h-3.5 w-3.5" /> {Math.round(readingProgress * 100)}% read
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
                    {details.description}
                  </p>

                  {/* Subjects / groups */}
                  {hasTags(details) && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {getTags(details).map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-border bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* More like this — same-kind recommendations from the catalog */}
              <MoreLikeThis media={details} />
            </div>

            {/* Floating Action Buttons (FAB) — landscape + always-visible quick actions */}
            <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3 sm:right-6">
              <FabButton
                label="Favorite"
                onClick={() => {
                  const wasFav = favorites.some((f) => f.id === details.id);
                  toggleFavorite(details);
                  pushToast(
                    wasFav ? "unfavorite" : "favorite",
                    wasFav ? `Removed “${details.title}” from your library` : `Added “${details.title}” to your library`
                  );
                }}
                active={favorites.some((f) => f.id === details.id)}
              >
                <Heart className={cn("h-5 w-5", favorites.some((f) => f.id === details.id) && "fill-current")} />
              </FabButton>
              <FabButton
                label="Share"
                onClick={() => {
                  if (navigator.share) navigator.share({ title: details.title, text: details.description }).catch(() => {});
                }}
              >
                <Share2 className="h-5 w-5" />
              </FabButton>
              <FabButton
                label={details.kind === "movie" ? "Play" : details.kind === "book" ? "Read" : "Watch"}
                primary
                onClick={() => openPlayer(details)}
              >
                {details.kind === "movie" ? <Play className="h-5 w-5 fill-current" /> : details.kind === "book" ? <BookOpen className="h-5 w-5" /> : <Radio className="h-5 w-5" />}
              </FabButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FabButton({
  children,
  label,
  onClick,
  primary,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  active?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.06 }}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid h-14 w-14 place-items-center rounded-full shadow-xl backdrop-blur transition-colors",
        primary
          ? "bg-[var(--brand)] text-[var(--brand-foreground)] brand-glow"
          : active
          ? "bg-[var(--brand)]/20 text-[var(--brand)] ring-1 ring-[var(--brand)]/40"
          : "border border-border bg-card/70 text-foreground hover:bg-card"
      )}
    >
      {children}
    </motion.button>
  );
}

function kindLabel(k: "movie" | "book" | "tv") {
  return k === "movie" ? "Public-domain film" : k === "book" ? "Public-domain book" : "Live IPTV channel";
}
function sourceLabel(k: "movie" | "book" | "tv") {
  return k === "movie" ? "Internet Archive" : k === "book" ? "Project Gutenberg" : "iptv-org";
}
function hasTags(m: any) {
  return (m.subjects?.length || m.group) as boolean;
}
function getTags(m: any): string[] {
  const tags: string[] = [];
  if (m.subjects) tags.push(...m.subjects);
  if (m.group && !tags.includes(m.group)) tags.push(m.group);
  return tags.slice(0, 8);
}

/** "More like this" — same-kind recommendations from the curated catalog.
 * For movies/books, picks 6 other titles (deterministic by title hash so the
 * set is stable per title). TV has no catalog, so we skip. */
function MoreLikeThis({ media }: { media: Media }) {
  const openDetails = useViewer((s) => s.openDetails);
  const recs = useMemo<Media[]>(() => {
    if (media.kind === "movie") {
      const pool = CURATED_MOVIES.filter((m) => m.identifier !== media.identifier).map(curatedToMedia);
      return pickRecs(pool, media.id, 6);
    }
    if (media.kind === "book") {
      const pool = CURATED_BOOKS.filter((b) => b.gutenbergId !== media.gutenbergId).map(curatedBookToMedia);
      return pickRecs(pool, media.id, 6);
    }
    return [];
  }, [media]);

  if (recs.length === 0) return null;

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 brand-text" />
        <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          More like this
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {recs.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            onClick={() => openDetails(m)}
            className="group relative aspect-[2/3] overflow-hidden rounded-xl ring-1 ring-white/10 transition hover:ring-[var(--brand)]/60 hover:brand-glow"
            aria-label={`Open ${m.title}`}
          >
            <MediaPoster media={m} className="h-full w-full" rounded="rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-80" />
            <div className="absolute inset-x-0 bottom-0 p-2">
              <p className="line-clamp-2 text-[11px] font-semibold text-white drop-shadow">{m.title}</p>
              {m.year && <p className="mt-0.5 text-[10px] text-white/60">{m.year}</p>}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/** Deterministic pick of `n` items from a pool, seeded by the current media id. */
function pickRecs(pool: Media[], seedId: string, n: number): Media[] {
  let h = 0;
  for (let i = 0; i < seedId.length; i++) h = (Math.imul(31, h) + seedId.charCodeAt(i)) | 0;
  const out: Media[] = [];
  const used = new Set<number>();
  let idx = Math.abs(h) % pool.length;
  let guard = 0;
  while (out.length < n && guard < pool.length * 2) {
    guard++;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(pool[idx]);
    }
    idx = (idx + 1) % pool.length;
  }
  return out;
}
