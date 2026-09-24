"use client";

import type { TvChannel } from "@/lib/types";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useOnboarding } from "@/lib/store";
import { useViewer } from "@/lib/viewer-store";
import { useShelf } from "@/lib/use-shelf";
import { useHotkeys } from "@/lib/use-hotkeys";
import { Onboarding } from "./onboarding";
import { TopBar } from "./topbar";
import { HeroFocusCarousel } from "./hero-focus-carousel";
import { CategoryRail, type RailConfig } from "./category-rail";
import { ContinueRail } from "./continue-rail";
import { SpotlightRail } from "./spotlight-rail";
import { CuratorNoteRail } from "./curator-note-rail";
import { BrowseNav } from "./browse-nav";
import { ScrollProgress } from "./scroll-progress";
import { CollectionsRail } from "./collections-rail";
import { CollectionViewer } from "./collection-viewer";
import { SearchOverlay } from "./search-overlay";
import { ToastViewport } from "./toast";
import { HallStats } from "./hall-stats";
import { BackToTop } from "./back-to-top";
import { DetailsPanel } from "./details-panel";
import { LiveTvPlayer, PlayerOverlay } from "./player-overlay";
import { ShortcutsOverlay } from "./shortcuts-overlay";
import { Footer } from "./footer";
import { MediaCard } from "./media-card";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Sparkles } from "lucide-react";

/** Hydration-safe "are we on the client?" — avoids setState-in-effect. */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const MOVIES_RAIL: RailConfig = {
  kind: "movie",
  title: "Films",
  subtitle: "Cinema discovered from external sources",
  categories: [
    { id: "featured", label: "Featured" },
    { id: "noir", label: "Noir" },
    { id: "silent", label: "Silent era" },
    { id: "scifi", label: "Sci-Fi" },
    { id: "horror", label: "Horror" },
    { id: "comedy", label: "Comedy" },
    { id: "documentary", label: "Documentary" },
  ],
};

const BOOKS_RAIL: RailConfig = {
  kind: "book",
  title: "Books",
  subtitle: "Literature discovered from external sources",
  categories: [
    { id: "popular", label: "Most read" },
    { id: "fiction", label: "Fiction" },
    { id: "mystery", label: "Mystery" },
    { id: "adventure", label: "Adventure" },
    { id: "history", label: "History" },
    { id: "philosophy", label: "Philosophy" },
    { id: "children", label: "Children" },
    { id: "science", label: "Science" },
  ],
};



export function AppShell() {
  const onboarded = useOnboarding((s) => s.onboarded);
  const onboardingOpen = useViewer((s) => s.onboardingOpen);
  const mounted = useMounted();
  useHotkeys();

  if (!mounted) return <Splash />;

  return (
    <>
      <ScrollProgress />
      <ThemeAndHome onboarded={onboarded} onboardingOpen={onboardingOpen} />
      <DetailsPanel />
      <PlayerOverlay />
      <CollectionViewer />
      <SearchOverlay />
      <ShortcutsOverlay />
      <BackToTop />
      <ToastViewport />
    </>
  );
}

function ThemeAndHome({
  onboarded,
  onboardingOpen,
}: {
  onboarded: boolean;
  onboardingOpen: boolean;
}) {
  if (!onboarded || onboardingOpen) {
    return <Onboarding />;
  }
  return <Home />;
}

function Home() {
  // Phase 2: the hero is intentionally movie-only.
  // Books and TV remain independent sections below.
  const movies = useShelf("movie", "featured", 8);
  const favorites = useOnboarding((s) => s.favorites);

  const movieHeroItems = movies.items;

  return (
    <div className="flex min-h-screen flex-col bg-background rise-in">
      <TopBar />
      <main className="flex-1">
        <div id="top" />
        {movieHeroItems.length > 0 ? (
          <HeroFocusCarousel items={movieHeroItems} />
        ) : (
          <div className="grid h-[78vh] min-h-[560px] place-items-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
          </div>
        )}

        <div className="mt-14 space-y-14">
          <HallStats />
          <BrowseNav />
          <SpotlightRail />
          <ContinueRail />
          <div id="movies">
            <CategoryRail config={MOVIES_RAIL} />
          </div>
          <CuratorNoteRail />
          <div id="books">
            <CategoryRail config={BOOKS_RAIL} />
          </div>
          <CollectionsRail />
          {favorites.length > 0 && <LibrarySection />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LibrarySection() {
  const favorites = useOnboarding((s) => s.favorites);
  return (
    <section id="library" className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 fill-[var(--brand)] text-[var(--brand)]" />
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Your library</h2>
          <p className="text-sm text-muted-foreground">
            {favorites.length} title{favorites.length === 1 ? "" : "s"} you've set aside.
          </p>
        </div>
      </div>
      <motion.div
        layout
        className="premium-scroll mt-4 flex gap-4 overflow-x-auto pb-2"
      >
        {favorites.map((m, i) => (
          <MediaCard key={m.id} media={m} index={i} />
        ))}
      </motion.div>
    </section>
  );
}

export function TvExperience() {
  const tvMode = useViewer((s) => s.tvMode);
  const channel = useViewer((s) => s.tvChannel);
  const closeTv = useViewer((s) => s.closeTv);
  const openTv = useViewer((s) => s.openTv);

  const tvShelf = useShelf("tv", "all", 500);
  const [channelBrowserOpen, setChannelBrowserOpen] = useState(false);

  const channels = tvShelf.items.filter(
    (item): item is TvChannel => item.kind === "tv"
  );

  useEffect(() => {
    if (!tvMode) {
      setChannelBrowserOpen(false);
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();

        if (channelBrowserOpen) {
          setChannelBrowserOpen(false);
        } else {
          closeTv();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tvMode, channelBrowserOpen, closeTv]);

  if (!tvMode || !channel) return null;

  const switchChannel = (nextChannel: TvChannel) => {
    setChannelBrowserOpen(false);
    openTv(nextChannel);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="tv-experience"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        className="fixed inset-0 z-[60] flex flex-col bg-black"
      >
        {/* TV top bar */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between bg-gradient-to-b from-black/95 via-black/65 to-transparent px-4 py-4 sm:px-6">
          <div className="min-w-0 pr-3">
            <p className="truncate text-sm font-semibold text-white">
              {channel.title}
            </p>

            <p className="truncate text-xs text-white/60">
              {channel.country || "Live TV"}
              {channel.group ? ` · ${channel.group}` : ""}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setChannelBrowserOpen((value) => !value)}
              className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur transition hover:bg-white/20"
              aria-expanded={channelBrowserOpen}
              aria-label="Open channel list"
            >
              Channels
            </button>

            <button
              type="button"
              onClick={closeTv}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Exit TV"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Live player */}
        <div className="relative min-h-0 flex-1">
          <LiveTvPlayer key={channel.id} media={channel} />
        </div>

        {/* Channel browser */}
        <AnimatePresence>
          {channelBrowserOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close channel list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setChannelBrowserOpen(false)}
                className="absolute inset-0 z-40 cursor-default bg-black/45"
              />

              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 360, damping: 34 }}
                className="absolute inset-y-0 right-0 z-50 flex w-[min(420px,92vw)] flex-col border-l border-white/10 bg-[#090909] shadow-2xl"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Channel List
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      {channels.length} available channels
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setChannelBrowserOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close channel list"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                  {tvShelf.loading && channels.length === 0 ? (
                    <div className="space-y-2">
                      {Array.from({ length: 10 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-[72px] animate-pulse rounded-xl bg-white/[0.05]"
                        />
                      ))}
                    </div>
                  ) : channels.length === 0 ? (
                    <div className="grid min-h-[240px] place-items-center px-6 text-center">
                      <div>
                        <p className="text-sm font-medium text-white">
                          No channels available
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          The IPTV index did not return any channels.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {channels.map((item) => {
                        const active = item.id === channel.id;
                        const imageSrc = item.logo || item.poster || "";

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => switchChannel(item)}
                            className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${
                              active
                                ? "bg-[var(--brand)]/15 ring-1 ring-[var(--brand)]/45"
                                : "hover:bg-white/[0.07]"
                            }`}
                          >
                            <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-black ring-1 ring-white/10">
                              {imageSrc ? (
                                <img
                                  src={imageSrc}
                                  alt=""
                                  loading="lazy"
                                  draggable={false}
                                  className="h-full w-full object-contain p-2"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <span className="text-sm font-semibold text-white/60">
                                  {item.title.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {item.title}
                              </p>

                              <p className="mt-0.5 truncate text-[11px] text-white/45">
                                {item.country || "Live TV"}
                                {item.group ? ` · ${item.group}` : ""}
                              </p>
                            </div>

                            {active && (
                              <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-red-300">
                                Live
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}


function Splash() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div
          className="grid h-16 w-16 animate-pulse place-items-center rounded-2xl text-white"
          style={{ background: "var(--brand)", boxShadow: "0 12px 40px -10px var(--brand)" }}
        >
          <Sparkles className="h-7 w-7" />
        </div>
        <p className="text-sm text-muted-foreground">Opening the Hall…</p>
      </div>
    </div>
  );
}
