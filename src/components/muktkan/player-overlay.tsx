"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewer } from "@/lib/viewer-store";
import { useOnboarding } from "@/lib/store";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react";
import type { Media, BookMedia, MovieMedia, TvChannel } from "@/lib/types";

export function PlayerOverlay() {
  const player = useViewer((s) => s.player);
  const close = useViewer((s) => s.closePlayer);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <AnimatePresence>
      {player && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col bg-black"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-full w-full flex-col"
          >
            {/* Top bar */}
            <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 bg-gradient-to-b from-black/80 to-transparent px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{player.title}</p>
                <p className="truncate text-xs text-white/60">
                  {player.kind === "movie" ? "Internet Archive" : player.kind === "book" ? "Project Gutenberg" : "Live IPTV"}
                  {player.creator ? ` · ${player.creator}` : ""}
                </p>
              </div>
              <button
                onClick={close}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Close player"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex-1">
              {player.kind === "movie" && <MoviePlayer media={player as MovieMedia} />}
              {player.kind === "book" && <BookReader media={player as BookMedia} />}
              {player.kind === "tv" && <LiveTvPlayer media={player as TvChannel} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MoviePlayer({ media }: { media: MovieMedia }) {
  return (
    <iframe
      src={media.embedUrl}
      title={media.title}
      className="absolute inset-0 h-full w-full"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      allowFullScreen
      referrerPolicy="no-referrer"
    />
  );
}

function BookReader({ media }: { media: BookMedia }) {
  const orientation = useOnboarding((s) => s.orientation);
  const setReadingProgress = useOnboarding((s) => s.setReadingProgress);
  const savedProgress = useOnboarding((s) => s.readingProgress[media.id] ?? 0);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Render-time adjustment: reset progress when switching books.
  const [lastId, setLastId] = useState(media.gutenbergId);
  if (lastId !== media.gutenbergId) {
    setLastId(media.gutenbergId);
    setText(null);
    setError(false);
    setProgress(0);
  }

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();
    fetch(`/api/book-text?gutenbergId=${media.gutenbergId}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => {
        if (cancelled) return;
        if (d && typeof d.text === "string") setText(d.text);
        else setError(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [media.gutenbergId]);

  // Restore saved reading position when text loads, or reset to top.
  useEffect(() => {
    if (text && scrollRef.current) {
      const el = scrollRef.current;
      const max = el.scrollHeight - el.clientHeight;
      el.scrollTop = savedProgress > 0 && max > 0 ? savedProgress * max : 0;
    }
  }, [text, savedProgress]);

  const pageTurn = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ top: dir * el.clientHeight * 0.88, behavior: "smooth" });
  };

  // Keyboard pagination / scroll for all modes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        pageTurn(1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        pageTurn(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onScrollProgress = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const frac = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
    setProgress(frac);
    // Persist the reading position (debounced via rAF so we don't thrash the store).
    if (rafProgress.current) cancelAnimationFrame(rafProgress.current);
    rafProgress.current = requestAnimationFrame(() => {
      setReadingProgress(media.id, frac);
    });
  };
  const rafProgress = useRef<number | null>(null);

  const sepia = orientation === "sepia";
  const paginated = orientation === "paginated";

  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-100 px-6 text-center text-stone-700">
        <AlertTriangle className="h-9 w-9 text-amber-500" />
        <p className="max-w-sm text-sm">
          This book's text couldn't be loaded right now. Try another title from the Books shelf, or
          read it directly on Project Gutenberg.
        </p>
        <a
          href={media.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 rounded-full bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-[var(--brand-foreground)]"
        >
          Open on gutenberg.org →
        </a>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-100 text-stone-500">
        <Loader2 className="h-7 w-7 animate-spin text-[var(--brand)]" />
        <p className="text-sm">Binding the pages…</p>
      </div>
    );
  }

  const paragraphs = text.split(/\n\n+/);

  const paperStyle: React.CSSProperties = sepia
    ? { background: "oklch(0.95 0.035 75)", color: "oklch(0.27 0.03 55)" }
    : { background: "#fffdf9", color: "oklch(0.22 0.01 60)" };

  return (
    <div className="absolute inset-0 flex bg-neutral-900">
      {/* Paper */}
      <div
        className={cn(
          "relative mx-auto my-0 h-full w-full max-w-3xl overflow-hidden shadow-2xl",
          sepia && "[filter:saturate(0.92)]"
        )}
        style={paperStyle}
      >
        {/* Scrollable text column. In paginated mode the scrollbar is hidden
            so the left/right buttons feel like turning pages (native scroll,
            no cross-origin iframe access). */}
        <div
          ref={scrollRef}
          onScroll={onScrollProgress}
          className={cn(
            "h-full overflow-y-auto px-6 py-12 sm:px-14 sm:py-16",
            paginated ? "no-scrollbar" : "premium-scroll"
          )}
          style={{ fontFamily: "var(--font-geist-sans), Georgia, serif" }}
        >
          <header className="mb-10 border-b pb-6" style={{ borderColor: "color-mix(in oklch, currentColor 18%, transparent)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-60">Project Gutenberg</p>
            <h1 className="mt-1.5 text-2xl font-semibold leading-tight sm:text-3xl">{media.title}</h1>
            {media.creator && <p className="mt-1 text-sm opacity-70">by {media.creator}</p>}
            {savedProgress > 0.02 && savedProgress < 0.99 && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[var(--brand)]/12 px-2.5 py-1 text-[11px] font-medium brand-text">
                Resuming at {Math.round(savedProgress * 100)}%
              </p>
            )}
          </header>

          <article className="text-[17px] leading-[1.85] sm:text-[18px]">
            {paragraphs.map((p, i) => {
              const t = p.trim();
              if (!t) return null;
              // Chapter / all-caps headings
              const isHeading = /^(\*\s*)?(CHAPTER|LETTER|PREFACE|INTRODUCTION|PROLOGUE|EPILOGUE|BOOK|PART|ACT|SCENE)\b/i.test(t) && t.length < 80;
              if (isHeading) {
                return (
                  <h2 key={i} className="mb-6 mt-12 text-center text-sm font-semibold uppercase tracking-[0.18em] opacity-80">
                    {t}
                  </h2>
                );
              }
              return (
                <p key={i} className="mb-5 whitespace-pre-wrap indent-8 sm:indent-10">
                  {t}
                </p>
              );
            })}
          </article>

          <footer className="py-16 text-center text-xs opacity-40">
            End of text · Project Gutenberg edition
          </footer>
        </div>

        {/* Page-turn controls — work for scroll, paginated, and sepia alike */}
        {paginated && (
          <>
            <button
              onClick={() => pageTurn(-1)}
              className="absolute left-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/85 text-stone-700 shadow-lg backdrop-blur transition hover:bg-white"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => pageTurn(1)}
              className="absolute right-2 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-black/10 bg-white/85 text-stone-700 shadow-lg backdrop-blur transition hover:bg-white"
              aria-label="Next page"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Mode + progress indicator */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur">
            {orientation === "scroll" ? "Continuous scroll" : orientation === "paginated" ? "Paginated · ← →" : "Sepia reading mode"}
          </span>
          <span className="hidden rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/80 backdrop-blur sm:inline">
            {Math.round(progress * 100)}%
          </span>
        </div>
        {/* Reading progress bar */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
          <div
            className="h-full bg-[var(--brand)] transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function LiveTvPlayer({ media }: { media: TvChannel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"loading" | "playing" | "error">("loading");

  useEffect(() => {
    let hls: any = null;
    const video = videoRef.current;
    if (!video) return;
    setState("loading");
    const url = media.streamUrl;
    const isHls = /\.m3u8(\?|$)/i.test(url) || url.includes(".m3u8");

    const onPlaying = () => setState("playing");
    const onError = () => setState("error");
    video.addEventListener("playing", onPlaying);
    video.addEventListener("error", onError);

    (async () => {
      try {
        if (isHls) {
          // Safari native HLS
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
            await video.play().catch(() => {});
          } else {
            const mod = await import("hls.js");
            const Hls = mod.default;
            if (Hls.isSupported()) {
              hls = new Hls({ enableWorker: true, lowLatencyMode: true });
              hls.loadSource(url);
              hls.attachMedia(video);
              hls.on(Hls.Events.ERROR, (_e: any, data: any) => {
                if (data.fatal) setState("error");
              });
              await video.play().catch(() => {});
            } else {
              setState("error");
            }
          }
        } else {
          video.src = url;
          await video.play().catch(() => {});
        }
      } catch {
        setState("error");
      }
    })();

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("error", onError);
      if (hls) hls.destroy();
    };
  }, [media.streamUrl]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-contain"
        playsInline
        controls
        autoPlay
        muted={false}
      />
      {state === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Tuning into {media.title}…</p>
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-white">
          <AlertTriangle className="h-9 w-9 text-amber-400" />
          <p className="max-w-sm text-sm text-white/80">
            This live stream couldn't be reached right now. IPTV channels rotate often — try another channel from the Live TV shelf.
          </p>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">{media.country}</span>
        </div>
      )}
      {state === "playing" && (
        <div className="pointer-events-none absolute left-4 top-16 flex items-center gap-2 rounded-full bg-red-600/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
        </div>
      )}
    </div>
  );
}
