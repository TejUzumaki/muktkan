"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewer } from "@/lib/viewer-store";
import { searchAll } from "@/lib/use-shelf";
import { MediaPoster } from "./media-poster";
import { Search, X, Loader2, Film, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Media } from "@/lib/types";

/**
 * Full-screen search overlay — a premium command-palette-style search
 * experience. Opened via the topbar search box focus or the `/` hotkey.
 * Debounced cross-source search (movies + books) with a results grid,
 * loading state, empty state, and click-through to details.
 */
export function SearchOverlay() {
  const open = useViewer((s) => s.searchFullOpen);
  const close = useViewer((s) => s.closeSearchFull);
  const openDetails = useViewer((s) => s.openDetails);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState<Media[]>([]);
  const [pending, setPending] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Render-time adjustment: reset state when the overlay opens (avoids
  // setState-in-effect).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setResults([]);
      setPending(false);
      setSelectedIdx(0);
    }
  }

  // Reset selection when results change (render-time).
  const [prevResults, setPrevResults] = useState(results);
  if (prevResults !== results) {
    setPrevResults(results);
    setSelectedIdx(0);
  }

  // Focus the input shortly after open.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Debounce query → debounced.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 220);
    return () => clearTimeout(t);
  }, [query]);

  // Fetch when debounced changes. Only kicks off when the query is long
  // enough; the empty-results state is handled in render via `showResults`.
  useEffect(() => {
    if (debounced.length < 2) return;
    let cancelled = false;
    const t = setTimeout(() => {
      setPending(true);
      searchAll(debounced).then((r) => {
        if (cancelled) return;
        setResults(r);
        setPending(false);
      });
    }, 60);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [debounced]);

  // Keyboard navigation: Esc closes, ↑/↓ move selection, Enter opens.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (!results.length) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const m = results[selectedIdx] ?? results[0];
        if (m) {
          openDetails(m);
          close();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, results, selectedIdx, openDetails]);

  const showResults = debounced.length >= 2;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[58] bg-background/85 backdrop-blur-xl"
          onClick={close}
        >
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 sm:py-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search header */}
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-border glass-strong px-4 py-3.5">
                <Search className="h-5 w-5 shrink-0 brand-text" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the Hall — films, books, authors…"
                  className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-lg"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label="Clear"
                    className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition hover:bg-card/60 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </div>
              <button
                onClick={close}
                className="hidden rounded-full border border-border bg-card/60 px-4 py-2.5 text-sm font-medium backdrop-blur transition hover:bg-card sm:block"
              >
                Close
              </button>
              <button
                onClick={close}
                aria-label="Close"
                className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card/60 backdrop-blur transition hover:bg-card sm:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results */}
            <div className="mt-6 flex-1 overflow-y-auto premium-scroll pb-10">
              {!showResults && (
                <div className="grid place-items-center py-20 text-center">
                  <div className="max-w-sm">
                    <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[var(--brand)]/12 brand-text">
                      <Search className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Search the collection</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Films from the Internet Archive and books from Project Gutenberg. Rights and availability depend on the source and applicable jurisdiction.
                    </p>
                  </div>
                </div>
              )}

              {showResults && !pending && results.length === 0 && (
                <div className="grid place-items-center py-20 text-center">
                  <p className="text-sm font-medium">Nothing matched “{debounced}”.</p>
                  <p className="mt-1 text-xs text-muted-foreground">Try a different title, author, or director.</p>
                </div>
              )}

              {showResults && results.length > 0 && (
                <>
                  <p className="mb-4 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    {results.length} result{results.length === 1 ? "" : "s"}
                  </p>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6">
                    {results.map((m, i) => (
                      <motion.button
                        key={m.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: Math.min(i * 0.025, 0.3) }}
                        onMouseEnter={() => setSelectedIdx(i)}
                        onClick={() => {
                          openDetails(m);
                          close();
                        }}
                        className={cn(
                          "group relative aspect-[2/3] overflow-hidden rounded-xl ring-1 transition",
                          i === selectedIdx
                            ? "ring-[var(--brand)]/70 brand-glow scale-[1.03]"
                            : "ring-white/10 hover:ring-[var(--brand)]/60 hover:brand-glow"
                        )}
                        aria-label={`Open ${m.title}`}
                      >
                        <MediaPoster media={m} className="h-full w-full" rounded="rounded-xl" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-90" />
                        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white backdrop-blur">
                          {m.kind === "movie" ? <Film className="h-2.5 w-2.5" /> : <BookOpen className="h-2.5 w-2.5" />}
                          {m.kind === "movie" ? "Film" : "Book"}
                        </div>
                        <div className="absolute inset-x-0 bottom-0 p-2">
                          <p className="line-clamp-2 text-xs font-semibold text-white drop-shadow">{m.title}</p>
                          {m.creator && <p className="mt-0.5 line-clamp-1 text-[10px] text-white/60">{m.creator}</p>}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
