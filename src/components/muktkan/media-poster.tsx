"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/types";

/**
 * Poster image with a premium branded SVG fallback when the source 404s
 * (common for archive.org / gutenberg covers that fail to load) OR when the
 * image hangs on a slow/dead host (archive.org is unreachable from the
 * sandbox — onError never fires because the request just times out, so a
 * load-timeout forces the branded fallback to show instead of a dark void).
 */
const LOAD_TIMEOUT_MS = 4500;

export function MediaPoster({
  media,
  className,
  rounded = "rounded-2xl",
}: {
  media: Media;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [posterSrc, setPosterSrc] = useState(media.poster);
  // Track the latest "loaded" flag in a ref so the timeout callback can read
  // fresh state without re-subscribing on every load.
  const loadedRef = useRef(false);

  // Reset state when the poster source changes — render-time adjustment
  // (the React-recommended alternative to setState-in-effect).
  if (posterSrc !== media.poster) {
    setPosterSrc(media.poster);
    setFailed(false);
    setLoaded(false);
  }

  // Start a load-timeout whenever the src changes. If the image hasn't fired
  // onLoad within the window, swap to the branded fallback so we never show
  // an empty dark rectangle for a hung request (archive.org unreachable
  // from the sandbox just hangs — onError never fires). The ref is reset
  // inside the effect (not during render) to stay lint-clean.
  useEffect(() => {
    if (!media.poster) return;
    loadedRef.current = false;
    const t = setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [media.poster]);

  if (failed || !media.poster) {
    return <BrandedFallback media={media} className={className} rounded={rounded} />;
  }

  return (
    <div className={cn("relative overflow-hidden", rounded, className)}>
      {!loaded && <div className="absolute inset-0 shimmer" />}
      <img
        src={media.poster}
        alt={media.title}
        loading="lazy"
        draggable={false}
        onLoad={() => {
          loadedRef.current = true;
          setLoaded(true);
        }}
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}

function BrandedFallback({
  media,
  className,
  rounded,
}: {
  media: Media;
  className?: string;
  rounded: string;
}) {
  // Deterministic gradient angle / variant from title.
  const seed = hash(media.title);
  const angle = 120 + (seed % 120);
  const variant = seed % 4;
  const initial = media.title.replace(/^The\s+|^A\s+|^An\s+/i, "").charAt(0).toUpperCase();

  return (
    <div
      className={cn("relative overflow-hidden", rounded, className)}
      style={{
        background: `linear-gradient(${variant % 2 ? angle : 360 - angle}deg, var(--brand) 0%, color-mix(in oklch, var(--brand) 35%, #000) 100%)`,
      }}
    >
      <svg viewBox="0 0 200 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id={`fb-${media.id}`} cx="50%" cy="32%" r="80%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#fff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.18" />
          </radialGradient>
        </defs>
        <rect width="200" height="300" fill={`url(#fb-${media.id})`} />
        {variant === 0 && <Concentric />}
        {variant === 1 && <Lines />}
        {variant === 2 && <Dots />}
        {variant === 3 && <Arcs />}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center">
        <span className="text-7xl font-semibold text-white/90 drop-shadow-lg">{initial}</span>
        <KindGlyph kind={media.kind} />
        <span className="line-clamp-3 text-sm font-medium text-white/85 drop-shadow">
          {media.title}
        </span>
      </div>
    </div>
  );
}

function Concentric() {
  return (
    <g fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="2">
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx="100" cy="120" r={20 + i * 22} />
      ))}
    </g>
  );
}
function Lines() {
  return (
    <g stroke="#fff" strokeOpacity="0.18" strokeWidth="2">
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={i} x1={-20 + i * 32} y1="0" x2={40 + i * 32} y2="300" />
      ))}
    </g>
  );
}
function Dots() {
  return (
    <g fill="#fff" fillOpacity="0.16">
      {Array.from({ length: 9 }).map((_, i) =>
        Array.from({ length: 6 }).map((_, j) => (
          <circle key={`${i}-${j}`} cx={20 + i * 22} cy={30 + j * 48} r={3} />
        ))
      )}
    </g>
  );
}
function Arcs() {
  return (
    <g fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="3" strokeLinecap="round">
      <path d="M20 200 A 80 80 0 0 1 180 200" />
      <path d="M40 220 A 60 60 0 0 1 160 220" />
      <path d="M60 240 A 40 40 0 0 1 140 240" />
    </g>
  );
}

function KindGlyph({ kind }: { kind: Media["kind"] }) {
  if (kind === "movie")
    return (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeOpacity="0.85">
        <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
        <path d="M10 9.5l5 2.5-5 2.5z" fill="#fff" fillOpacity="0.9" stroke="none" />
      </svg>
    );
  if (kind === "book")
    return (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeOpacity="0.85">
        <path d="M5 4h9a2 2 0 0 1 2 2v14a1 1 0 0 0-1-1H5z" />
        <path d="M19 4h-3a2 2 0 0 0-2 2v14a1 1 0 0 1 1-1h4z" />
      </svg>
    );
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeOpacity="0.85">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9.5l5 2.5-5 2.5z" fill="#fff" fillOpacity="0.9" stroke="none" />
    </svg>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
