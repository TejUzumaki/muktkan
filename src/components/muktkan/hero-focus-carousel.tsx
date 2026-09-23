"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Media } from "@/lib/types";
import { useViewer } from "@/lib/viewer-store";
import { MediaPoster } from "./media-poster";
import { MediaActions } from "./media-actions";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Shuffle,
  BadgeCheck,
} from "lucide-react";

const SETTLE_DELAY = 1000;

type ArtworkState = {
  src: string | null;
  ready: boolean;
};

function candidateArtwork(media: Media): string[] {
  const candidates: string[] = [];

  const add = (value?: string | null) => {
    if (!value) return;
    if (!candidates.includes(value)) candidates.push(value);
  };

  add(media.poster);
  add(media.backdrop);

  /*
   * Movie records from Internet Archive carry their archive
   * identifier. This gives us another deterministic image source
   * without inventing a new asset.
   */
  if (media.kind === "movie" && media.identifier) {
    add(`https://archive.org/services/img/${media.identifier}`);
  }

  return candidates;
}

async function decodeImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;

    if (typeof image.decode === "function") {
      void image
        .decode()
        .then(() => resolve(true))
        .catch(() => {
          // onload/onerror remains authoritative.
        });
    }
  });
}

async function resolveArtwork(media: Media): Promise<string | null> {
  const candidates = candidateArtwork(media);

  /*
   * First use the artwork already supplied by the source.
   * This is the fastest and most trustworthy path.
   */
  for (const src of candidates) {
    if (await decodeImage(src)) {
      return src;
    }
  }

  /*
   * Last network lookup before the branded fallback.
   *
   * Wikimedia's page-summary endpoint gives us a title-based
   * image without requiring a third-party image scraper.
   */
  if (media.kind === "movie" && media.title) {
    try {
      const title = encodeURIComponent(media.title.trim());

      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as {
          thumbnail?: { source?: string };
          originalimage?: { source?: string };
        };

        const wikiImage =
          data.originalimage?.source ||
          data.thumbnail?.source ||
          null;

        if (wikiImage && (await decodeImage(wikiImage))) {
          return wikiImage;
        }
      }
    } catch {
      // Keep the branded fallback if the lookup is unavailable.
    }
  }

  return null;
}

export function HeroFocusCarousel({ items }: { items: Media[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const focusedIdx = useRef(0);
  const rafRef = useRef<number | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [focused, setFocused] = useState<Media | null>(items[0] ?? null);
  const [artwork, setArtwork] = useState<ArtworkState>({
    src: null,
    ready: false,
  });
  const [settling, setSettling] = useState(false);

  const sig = items.length
    ? `${items.length}:${items[0]?.id}:${items[items.length - 1]?.id}`
    : "";

  const [prevSig, setPrevSig] = useState(sig);

  if (sig !== prevSig) {
    setPrevSig(sig);
    setFocused(items[0] ?? null);
    focusedIdx.current = 0;
    setArtwork({ src: null, ready: false });
  }

  const getCenteredIndex = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller || itemRefs.current.length === 0) {
      return focusedIdx.current;
    }

    const center = scroller.scrollLeft + scroller.clientWidth / 2;

    let best = focusedIdx.current;
    let bestDistance = Infinity;

    itemRefs.current.forEach((el, index) => {
      if (!el) return;

      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);

      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });

    return best;
  }, []);

  const applyCardState = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;

    itemRefs.current.forEach((el) => {
      if (!el) return;

      const cardCenter = el.offsetLeft + el.offsetWidth / 2;
      const distance = Math.abs(cardCenter - center);
      const slot = Math.max(el.offsetWidth, 1);

      const normalized = Math.min(1, distance / (slot * 2.15));

      const scale = 1 - normalized * 0.075;
      const lift = -14 * Math.max(0, 1 - normalized);
      const opacity = 0.72 + (1 - normalized) * 0.28;

      el.style.transform =
        `translate3d(0, ${lift}px, 0) scale(${scale})`;

      el.style.opacity = `${opacity}`;
    });
  }, []);

  const scrollToItem = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    const card = itemRefs.current[index];

    if (!scroller || !card) return;

    const target =
      card.offsetLeft -
      scroller.clientWidth / 2 +
      card.offsetWidth / 2;

    scroller.scrollTo({
      left: target,
      behavior: "smooth",
    });
  }, []);

  const shuffle = useCallback(() => {
    if (items.length <= 1) return;

    let next = Math.floor(Math.random() * items.length);

    if (next === focusedIdx.current) {
      next = (next + 1) % items.length;
    }

    scrollToItem(next);
  }, [items.length, scrollToItem]);

  const loadArtwork = useCallback(
    async (media: Media) => {
      setSettling(true);

      const src = await resolveArtwork(media);

      /*
       * The user may have resumed scrolling while the network
       * lookup/decode was happening. Never show stale artwork.
       */
      const currentIndex = getCenteredIndex();

      if (items[currentIndex]?.id !== media.id) {
        return;
      }

      if (src) {
        setArtwork({
          src,
          ready: true,
        });
      } else {
        setArtwork({
          src: null,
          ready: false,
        });
      }

      setSettling(false);
    },
    [getCenteredIndex, items]
  );

  const scheduleArtwork = useCallback(
    (index: number) => {
      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }

      /*
       * During active scrolling, remove the current artwork and let
       * the persistent branded atmosphere take over.
       */
      setArtwork({
        src: null,
        ready: false,
      });

      setSettling(true);

      const candidate = items[index];

      if (!candidate) {
        setSettling(false);
        return;
      }

      settleTimerRef.current = setTimeout(() => {
        settleTimerRef.current = null;
        void loadArtwork(candidate);
      }, SETTLE_DELAY);
    },
    [items, loadArtwork]
  );

  const onScroll = useCallback(() => {
    if (settleTimerRef.current) {
      clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }

    setSettling(true);

    setArtwork({
      src: null,
      ready: false,
    });

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      applyCardState();

      const nextIndex = getCenteredIndex();

      if (nextIndex !== focusedIdx.current) {
        focusedIdx.current = nextIndex;

        const next = items[nextIndex];

        if (next) {
          setFocused(next);
        }
      }

      scheduleArtwork(nextIndex);
    });
  }, [
    applyCardState,
    getCenteredIndex,
    items,
    scheduleArtwork,
  ]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller || items.length === 0) return;

    const frame = requestAnimationFrame(() => {
      const first = itemRefs.current[0];

      if (!first) return;

      /*
       * First card begins from the actual scroll origin.
       * No invisible two-card spacers.
       */
      scroller.scrollLeft = 0;

      applyCardState();

      focusedIdx.current = 0;
      setFocused(items[0] ?? null);
      scheduleArtwork(0);
    });

    return () => cancelAnimationFrame(frame);
  }, [items, applyCardState, scheduleArtwork]);

  useEffect(() => {
    const onResize = () => {
      requestAnimationFrame(applyCardState);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [applyCardState]);

  useEffect(() => {
    const onPrev = () => {
      scrollToItem(Math.max(0, focusedIdx.current - 1));
    };

    const onNext = () => {
      scrollToItem(Math.min(items.length - 1, focusedIdx.current + 1));
    };

    const onShuffle = () => {
      shuffle();
    };

    const onPlay = () => {
      const current = items[focusedIdx.current];

      if (current) {
        useViewer.getState().openPlayer(current);
      }
    };

    const onDetails = () => {
      const current = items[focusedIdx.current];

      if (current) {
        useViewer.getState().openDetails(current);
      }
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
  }, [items, scrollToItem, shuffle]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      if (settleTimerRef.current) {
        clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  if (!items.length) return null;

  return (
    <section className="relative">
      <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
        <div className="absolute inset-0 overflow-hidden bg-background">
          <BrandedHeroAtmosphere active={!artwork.ready} />
        </div>

        <div className="absolute inset-0">
          {artwork.src && artwork.ready && (
            <img
              key={artwork.src}
              src={artwork.src}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                animation:
                  "no-dish-hero-artwork-in 1.25s ease both",
              }}
            />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/15" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/35 to-transparent" />

        <div
          className="pointer-events-none absolute inset-0 opacity-55"
          style={{
            background:
              "radial-gradient(70% 60% at 30% 70%, color-mix(in oklch, var(--brand) 55%, transparent), transparent 70%)",
          }}
        />

        <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.12]" />
        <div className="hero-vignette pointer-events-none absolute inset-0" />

        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto max-w-7xl px-4 pb-44 sm:px-6 sm:pb-40 lg:pb-32">
            {focused && (
              <div
                key={focused.id}
                className="max-w-xl"
                style={{
                  animation:
                    "no-dish-hero-copy-in 420ms cubic-bezier(0.22,1,0.36,1) both",
                }}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="brand-text">
                    {kindLabel(focused.kind)}
                  </span>

                  <span
                    className="h-1 w-1 rounded-full bg-muted-foreground/50"
                    aria-hidden
                  />

                  <span>{focused.meta?.[0] ?? "Featured"}</span>

                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal brand-text">
                    <BadgeCheck className="h-3 w-3" />
                    Source information
                  </span>
                </div>

                <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                  {focused.title}
                </h1>

                {focused.creator && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    directed by{" "}
                    <span className="text-foreground/80">
                      {focused.creator}
                    </span>
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                  {focused.year && <span>{focused.year}</span>}

                  {focused.year && (
                    <span
                      className="h-1 w-1 rounded-full bg-muted-foreground/40"
                      aria-hidden
                    />
                  )}

                  <span>{sourceLabel(focused.kind)}</span>

                  <span
                    className="h-1 w-1 rounded-full bg-muted-foreground/40"
                    aria-hidden
                  />

                  <span>
                    Rights vary by source and jurisdiction
                  </span>
                </div>

                <p className="mt-4 line-clamp-3 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
                  {focused.description}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <MediaActions media={focused} variant="hero" />

                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/40 p-1 backdrop-blur">
                    <button
                      onClick={() =>
                        useViewer.getState().openDetails(focused)
                      }
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-card/80"
                    >
                      <Info className="h-4 w-4" />
                      Details
                    </button>

                    <span
                      className="h-5 w-px bg-border"
                      aria-hidden
                    />

                    <button
                      onClick={shuffle}
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:bg-card/80"
                      aria-label="Surprise me — jump to a random title"
                      title="Surprise me (S)"
                    >
                      <Shuffle className="h-4 w-4 brand-text" />
                      Surprise
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative z-20 -mt-32 sm:-mt-28">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-30 w-10 bg-gradient-to-r from-background to-transparent sm:w-20" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-10 bg-gradient-to-l from-background to-transparent sm:w-20" />

        <button
          aria-label="Previous"
          onClick={() =>
            scrollToItem(Math.max(0, focusedIdx.current - 1))
          }
          className="absolute left-2 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/60 p-2.5 backdrop-blur transition hover:bg-card sm:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          aria-label="Next"
          onClick={() =>
            scrollToItem(
              Math.min(items.length - 1, focusedIdx.current + 1)
            )
          }
          className="absolute right-2 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/60 p-2.5 backdrop-blur transition hover:bg-card sm:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="hero-five-scroll no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          style={
            {
              "--hero-gap": "clamp(8px, 1.2vw, 20px)",
              "--hero-slot":
                "calc((100% - (var(--hero-gap) * 4)) / 5)",
            } as React.CSSProperties
          }
        >
          {items.map((media, index) => (
            <div
              key={media.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              onClick={() => {
                if (index !== focusedIdx.current) {
                  scrollToItem(index);
                }
              }}
              className={cn(
                "hero-card-slot relative shrink-0 snap-start cursor-pointer",
                "transition-[transform,opacity] duration-200 ease-out"
              )}
              style={{
                width: "var(--hero-slot)",
                marginRight:
                  index === items.length - 1
                    ? "0px"
                    : "var(--hero-gap)",
              }}
            >
              <FocusCard
                media={media}
                active={focused?.id === media.id}
              />
            </div>
          ))}

          <div
            aria-hidden
            className="shrink-0"
            style={{
              width: "0px",
            }}
          />
        </div>

        <div className="pointer-events-none absolute bottom-3 left-1/2 z-40 -translate-x-1/2">
          <div
            className={cn(
              "h-1 rounded-full bg-[var(--brand)] transition-all duration-500",
              settling ? "w-10 opacity-60" : "w-0 opacity-0"
            )}
          />
        </div>
      </div>

      <style jsx>{`
        .hero-five-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          padding-top: 76px;
          padding-bottom: 34px;
        }

        .hero-five-scroll::-webkit-scrollbar {
          display: none;
        }

        .hero-card-slot {
          will-change: transform, opacity;
          transform-origin: center bottom;
        }

        @keyframes no-dish-hero-artwork-in {
          0% {
            opacity: 0;
            transform: scale(1.018);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes no-dish-hero-copy-in {
          0% {
            opacity: 0;
            transform: translateY(7px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes no-dish-orbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes no-dish-orbit-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes no-dish-pulse {
          0%,
          100% {
            opacity: 0.18;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.34;
            transform: scale(1.03);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-five-scroll {
            scroll-behavior: auto;
          }

          .hero-card-slot {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}

function BrandedHeroAtmosphere({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-opacity duration-700",
        active ? "opacity-100" : "opacity-0"
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 80% at 20% 20%, color-mix(in oklch, var(--brand) 32%, transparent), transparent 65%), radial-gradient(60% 70% at 85% 75%, color-mix(in oklch, var(--brand) 22%, transparent), transparent 65%), linear-gradient(135deg, color-mix(in oklch, var(--background) 92%, var(--brand)) 0%, var(--background) 78%)",
        }}
      />

      <div className="absolute inset-0 grid place-items-center">
        <div
          className="relative h-[52vh] w-[52vh] max-h-[620px] max-w-[620px]"
          style={{
            animation: "no-dish-pulse 7s ease-in-out infinite",
          }}
        >
          <svg
            viewBox="0 0 600 600"
            className="absolute inset-0 h-full w-full"
            fill="none"
          >
            <defs>
              <radialGradient id="noDishCore">
                <stop
                  offset="0%"
                  stopColor="var(--brand)"
                  stopOpacity="0.2"
                />
                <stop
                  offset="70%"
                  stopColor="var(--brand)"
                  stopOpacity="0.035"
                />
                <stop
                  offset="100%"
                  stopColor="var(--brand)"
                  stopOpacity="0"
                />
              </radialGradient>
            </defs>

            <circle
              cx="300"
              cy="300"
              r="270"
              fill="url(#noDishCore)"
            />

            <g
              style={{
                transformOrigin: "300px 300px",
                animation:
                  "no-dish-orbit 22s linear infinite",
              }}
            >
              <ellipse
                cx="300"
                cy="300"
                rx="250"
                ry="105"
                stroke="var(--brand)"
                strokeOpacity="0.18"
                strokeWidth="1.5"
              />
              <ellipse
                cx="300"
                cy="300"
                rx="210"
                ry="72"
                stroke="var(--brand)"
                strokeOpacity="0.11"
              />
              <path
                d="M300 50 L325 92 L275 92 Z"
                fill="var(--brand)"
                fillOpacity="0.22"
              />
            </g>

            <g
              style={{
                transformOrigin: "300px 300px",
                animation:
                  "no-dish-orbit-reverse 31s linear infinite",
              }}
            >
              <ellipse
                cx="300"
                cy="300"
                rx="175"
                ry="250"
                stroke="var(--brand)"
                strokeOpacity="0.12"
              />
              <ellipse
                cx="300"
                cy="300"
                rx="115"
                ry="225"
                stroke="var(--brand)"
                strokeOpacity="0.08"
              />
              <path
                d="M300 74 L314 98 L286 98 Z"
                fill="var(--brand)"
                fillOpacity="0.16"
              />
            </g>
          </svg>

          <div className="absolute inset-0 grid place-items-center">
            <span className="select-none text-[clamp(7rem,18vw,13rem)] font-black leading-none tracking-[-0.08em] text-[var(--brand)] opacity-[0.13]">
              N
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 40% at 50% 45%, transparent 0%, color-mix(in oklch, var(--background) 30%, transparent) 70%, var(--background) 100%)",
        }}
      />
    </div>
  );
}

function FocusCard({
  media,
  active,
}: {
  media: Media;
  active: boolean;
}) {
  const openDetails = useViewer((s) => s.openDetails);

  return (
    <div
      className={cn(
        "group relative aspect-[2/3] overflow-hidden rounded-2xl ring-1",
        "transition-[box-shadow,border-color] duration-300",
        active
          ? "ring-[var(--brand)]/70 brand-glow"
          : "ring-white/10"
      )}
    >
      <MediaPoster
        media={media}
        className="h-full w-full"
        rounded="rounded-2xl"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />

      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-[9px] font-medium uppercase tracking-wider text-white/65 sm:text-[10px]">
          {kindLabel(media.kind)}
        </p>

        <p className="line-clamp-2 text-[12px] font-semibold text-white drop-shadow sm:text-sm">
          {media.title}
        </p>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
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

function kindLabel(kind: Media["kind"]) {
  return kind === "movie"
    ? "Film"
    : kind === "book"
      ? "Book"
      : "Live";
}

function sourceLabel(kind: Media["kind"]) {
  return kind === "movie"
    ? "Internet Archive"
    : kind === "book"
      ? "Project Gutenberg"
      : "iptv-org";
}
