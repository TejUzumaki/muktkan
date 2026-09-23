"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Media } from "@/lib/types";
import { useViewer } from "@/lib/viewer-store";
import { MediaPoster } from "./media-poster";
import { MediaActions } from "./media-actions";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Info, Shuffle, BadgeCheck } from "lucide-react";
import { HeroBackdrop } from "./hero-backdrop";

export function HeroFocusCarousel({ items }: { items: Media[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const focusedIdx = useRef(0);
  const raf = useRef<number | null>(null);

  const [focused, setFocused] = useState<Media | null>(items[0] ?? null);
  const [padLeft, setPadLeft] = useState(0);

  // Render-time adjustment: reset focused to the first item whenever the
  // underlying item set changes (avoids setState-in-effect for prop changes).
  const sig = items.length ? `${items.length}:${items[0]?.id}:${items[items.length - 1]?.id}` : "";
  const [prevSig, setPrevSig] = useState(sig);
  if (sig !== prevSig) {
    setPrevSig(sig);
    setFocused(items[0] ?? null);
  }

  /** Pure DOM update — applies per-card transforms based on distance to
   * center. Updates the focusedIdx ref. Does NOT call setState. */
  const applyTransforms = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return 0;
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const itemCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(itemCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
      const norm = Math.min(1, dist / (scroller.clientWidth * 0.42));
      const scale = 1 - 0.26 * norm;
      const lift = -34 * (1 - norm) * (1 - norm);
      const opacity = 0.55 + 0.45 * (1 - norm);
      const rot = ((itemCenter - center) / scroller.clientWidth) * 6;
      el.style.transform = `translateY(${lift}px) scale(${scale}) rotateY(${rot}deg)`;
      el.style.opacity = `${opacity}`;
      el.style.zIndex = `${100 - Math.round(dist)}`;
    });
    focusedIdx.current = best;
    return best;
  }, []);

  /** Called on scroll — DOM update + conditional state update via functional
   * setState (avoids stale closures and setState-in-effect). */
  const onScroll = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const best = applyTransforms();
      const item = items[best];
      if (item) {
        setFocused((prev) => (prev?.id === item.id ? prev : item));
      }
    });
  }, [applyTransforms, items]);

  // Initial layout: apply transforms + center the first card. DOM-only.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || items.length === 0) return;
    // Defer until layout settles.
    const id = requestAnimationFrame(() => {
      applyTransforms();
    });
    return () => cancelAnimationFrame(id);
  }, [items, applyTransforms]);

  // Measure symmetric padding so the first/last cards can center (coverflow).
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    const first = itemRefs.current[0];
    if (!scroller || !first) return;
    const measure = () => {
      const card = first.offsetWidth;
      const pad = Math.max(16, (scroller.clientWidth - card) / 2);
      setPadLeft(pad);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  // Once the centering padding is applied, reset to the first card and lay out.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !items.length) return;
    scroller.scrollLeft = 0;
    applyTransforms();
  }, [padLeft, items, applyTransforms]);

  const scrollToItem = (idx: number) => {
    const scroller = scrollerRef.current;
    const el = itemRefs.current[idx];
    if (!scroller || !el) return;
    scroller.scrollTo({
      left: el.offsetLeft - scroller.clientWidth / 2 + el.offsetWidth / 2,
      behavior: "smooth",
    });
  };

  const shuffle = () => {
    if (items.length <= 1) return;
    let next = Math.floor(Math.random() * items.length);
    if (next === focusedIdx.current) next = (next + 1) % items.length;
    scrollToItem(next);
  };

  // Listen for global keyboard-driven hero events (dispatched by useHotkeys).
  useEffect(() => {
    const onPrev = () => scrollToItem(Math.max(0, focusedIdx.current - 1));
    const onNext = () => scrollToItem(Math.min(items.length - 1, focusedIdx.current + 1));
    const onShuffle = () => shuffle();
    const onPlay = () => {
      const f = items[focusedIdx.current];
      if (f) useViewer.getState().openPlayer(f);
    };
    const onDetails = () => {
      const f = items[focusedIdx.current];
      if (f) useViewer.getState().openDetails(f);
    };
    window.addEventListener("muktkan:hero-prev", onPrev);
    window.addEventListener("muktkan:hero-next", onNext);
    window.addEventListener("muktkan:hero-shuffle", onShuffle);
    window.addEventListener("muktkan:hero-play", onPlay);
    window.addEventListener("muktkan:hero-details", onDetails);
    return () => {
      window.removeEventListener("muktkan:hero-prev", onPrev);
      window.removeEventListener("muktkan:hero-next", onNext);
      window.removeEventListener("muktkan:hero-shuffle", onShuffle);
      window.removeEventListener("muktkan:hero-play", onPlay);
      window.removeEventListener("muktkan:hero-details", onDetails);
    };
  }, [items]);

  if (!items.length) return null;

  return (
    <section className="relative">
      {/* Hero backdrop */}
      <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        {/* Always-present branded atmosphere base — visible even when the
            backdrop image fails to load (archive.org/gutenberg unreachable),
            so the hero never looks like a flat void. Multi-layered for depth. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(90% 80% at 18% 22%, color-mix(in oklch, var(--brand) 42%, transparent), transparent 55%), radial-gradient(75% 65% at 88% 82%, color-mix(in oklch, var(--brand) 30%, transparent), transparent 60%), radial-gradient(60% 50% at 60% 50%, color-mix(in oklch, var(--brand) 14%, transparent), transparent 70%), linear-gradient(135deg, color-mix(in oklch, var(--background) 88%, var(--brand)) 0%, var(--background) 75%)",
          }}
        />
        {/* Subtle moving aurora wash for life — a slow, brand-tinted conic
            sweep that gives the static gradient a hint of motion. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30 mix-blend-soft-light"
          style={{
            background:
              "conic-gradient(from 180deg at 70% 40%, transparent 0deg, color-mix(in oklch, var(--brand) 50%, transparent) 60deg, transparent 140deg, color-mix(in oklch, var(--brand) 30%, transparent) 220deg, transparent 360deg)",
            animation: "muktkan-aurora 18s linear infinite",
          }}
        />
        <AnimatePresence mode="popLayout">
          {focused && (
            <motion.div
              key={focused.id}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {/* Robust backdrop: branded gradient fallback if the cover image
                  hangs (archive.org unreachable) or 404s. */}
              <HeroBackdrop media={focused} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/20" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/35 to-transparent" />
              <div
                className="absolute inset-0 mix-blend-soft-light opacity-60"
                style={{
                  background:
                    "radial-gradient(70% 60% at 30% 70%, color-mix(in oklch, var(--brand) 60%, transparent), transparent 70%)",
                }}
              />
              {/* Cinematic film grain */}
              <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.22]" />
              {/* Vignette for depth */}
              <div className="hero-vignette pointer-events-none absolute inset-0" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Grain + vignette also on the base layer so they show even without an image */}
        <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.14]" />
        <div className="hero-vignette pointer-events-none absolute inset-0" />

        {/* Hero copy */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-7xl px-4 pb-44 sm:px-6 sm:pb-40 lg:pb-32">
            <AnimatePresence mode="wait">
              {focused && (
                <motion.div
                  key={focused.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-xl"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    <span className="brand-text">{kindLabel(focused.kind)}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                    <span>{focused.meta?.[0] ?? "Featured"}</span>
                    {/* Source information badge */}
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal brand-text">
                      <BadgeCheck className="h-3 w-3" /> Source information
                    </span>
                  </div>
                  <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                    {focused.title}
                  </h1>
                  {focused.creator && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {focused.kind === "book" ? "by" : "directed by"}{" "}
                      <span className="text-foreground/80">{focused.creator}</span>
                    </p>
                  )}
                  {/* Richer meta row: year · source · era */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                    {focused.year && <span>{focused.year}</span>}
                    {focused.year && <span className="h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden />}
                    <span>{sourceLabel(focused.kind)}</span>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" aria-hidden />
                    <span>Rights vary by source and jurisdiction</span>
                  </div>
                  <p className="mt-4 line-clamp-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                    {focused.description}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <MediaActions media={focused} variant="hero" />
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 p-1 backdrop-blur">
                      <button
                        onClick={() => useViewer.getState().openDetails(focused)}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-card/80"
                      >
                        <Info className="h-4 w-4" /> Details
                      </button>
                      <span className="h-5 w-px bg-border" aria-hidden />
                      <button
                        onClick={shuffle}
                        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-card/80"
                        aria-label="Surprise me — jump to a random title"
                        title="Surprise me (S)"
                      >
                        <Shuffle className="h-4 w-4 brand-text" /> Surprise
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* The center-focus carousel */}
      <div className="relative z-20 -mt-32 sm:-mt-28">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-16 bg-gradient-to-r from-background to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-16 bg-gradient-to-l from-background to-transparent sm:w-28" />
        <button
          aria-label="Previous"
          onClick={() => scrollToItem(Math.max(0, focusedIdx.current - 1))}
          className="absolute left-2 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/60 p-2.5 backdrop-blur transition hover:bg-card sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          aria-label="Next"
          onClick={() => scrollToItem(Math.min(items.length - 1, focusedIdx.current + 1))}
          className="absolute right-2 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/60 p-2.5 backdrop-blur transition hover:bg-card sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="premium-scroll mask-fade-edges flex snap-x snap-mandatory gap-5 overflow-x-auto pb-8 pt-24 no-scrollbar"
          style={{ paddingLeft: padLeft, scrollPaddingLeft: "50%", scrollPaddingRight: "50%" }}
        >
          {items.map((m, i) => (
            <div
              key={m.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              onClick={() => scrollToItem(i)}
              className="relative w-[58vw] shrink-0 cursor-pointer snap-center sm:w-[280px] lg:w-[300px]"
              style={{ transformOrigin: "center bottom", transition: "transform 0.18s ease, opacity 0.18s ease" }}
            >
              <FocusCard media={m} active={focused?.id === m.id} />
            </div>
          ))}
          {/* Trailing spacer so the last card can center too. */}
          <div className="shrink-0" style={{ width: padLeft }} aria-hidden />
        </div>
      </div>
    </section>
  );
}

function FocusCard({ media, active }: { media: Media; active: boolean }) {
  const openDetails = useViewer((s) => s.openDetails);
  return (
    <div
      className={cn(
        "group relative aspect-[2/3] overflow-hidden rounded-2xl ring-1 transition-all duration-300",
        active ? "ring-[var(--brand)]/60 brand-glow" : "ring-white/10"
      )}
    >
      <MediaPoster media={media} className="h-full w-full" rounded="rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />
      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/70">{kindLabel(media.kind)}</p>
        <p className="line-clamp-2 text-sm font-semibold text-white drop-shadow">{media.title}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          openDetails(media);
        }}
        className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-black/70"
        aria-label="Details"
      >
        <Info className="h-4 w-4" />
      </button>
    </div>
  );
}

function kindLabel(k: Media["kind"]) {
  return k === "movie" ? "Film" : k === "book" ? "Book" : "Live";
}

function sourceLabel(k: Media["kind"]) {
  return k === "movie" ? "Internet Archive" : k === "book" ? "Project Gutenberg" : "iptv-org";
}
