"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/types";

/**
 * HeroBackdrop — a robust backdrop image for the hero with the same
 * load-timeout + branded-fallback behavior as MediaPoster, but tuned for the
 * full-bleed hero use-case (ambient blur layer + main cover layer).
 *
 * If the source image loads, both layers show it (one blurred, one crisp).
 * If it hangs (archive.org unreachable from sandbox) or 404s, a branded
 * gradient backdrop renders instead so the hero never looks like a flat void.
 */
const LOAD_TIMEOUT_MS = 4500;

export function HeroBackdrop({ media }: { media: Media }) {
  const src = media.backdrop || media.poster;
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [srcState, setSrcState] = useState(src);
  const loadedRef = useRef(false);

  // Render-time adjustment: reset state when the source changes.
  if (srcState !== src) {
    setSrcState(src);
    setLoaded(false);
    setFailed(false);
  }

  useEffect(() => {
    if (!src) return;
    loadedRef.current = false;
    const t = setTimeout(() => {
      if (!loadedRef.current) setFailed(true);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [src]);

  if (failed || !src) {
    return <BrandedBackdrop media={media} />;
  }

  return (
    <>
      {/* Ambient blurred layer */}
      <img
        src={src}
        alt=""
        aria-hidden
        className={cn(
          "absolute inset-0 h-full w-full scale-125 object-cover blur-2xl transition-opacity duration-700",
          loaded ? "opacity-40" : "opacity-0"
        )}
        onLoad={() => {
          loadedRef.current = true;
          setLoaded(true);
        }}
        onError={() => setFailed(true)}
      />
      {/* Main crisp cover layer */}
      <img
        src={src}
        alt=""
        className={cn(
          "relative h-full w-full object-cover transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => {
          loadedRef.current = true;
          setLoaded(true);
        }}
        onError={() => setFailed(true)}
      />
    </>
  );
}

/** A premium branded backdrop used when no image is available — a layered
 *  gradient wash keyed to the title so different titles get different moods. */
function BrandedBackdrop({ media }: { media: Media }) {
  const seed = hash(media.title);
  const angle = 120 + (seed % 120);
  return (
    <div className="absolute inset-0">
      {/* Base brand gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${angle}deg, color-mix(in oklch, var(--brand) 45%, transparent) 0%, color-mix(in oklch, var(--brand) 18%, transparent) 40%, var(--background) 90%)`,
        }}
      />
      {/* Oversized faded initial for texture */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.1]"
        aria-hidden
      >
        <span className="select-none text-[42vh] font-black leading-none text-[var(--brand-foreground)]">
          {media.title.replace(/^The\s+|^A\s+|^An\s+/i, "").charAt(0).toUpperCase()}
        </span>
      </div>
      {/* Diagonal sheen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(115deg, transparent 30%, color-mix(in oklch, var(--brand-foreground) 18%, transparent) 48%, transparent 66%)",
        }}
      />
    </div>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
