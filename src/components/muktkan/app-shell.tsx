"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useOnboarding } from "@/lib/store";
import { useViewer } from "@/lib/viewer-store";
import { useShelf } from "@/lib/use-shelf";
import { useHotkeys } from "@/lib/use-hotkeys";
import type { Media } from "@/lib/types";
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
import { PlayerOverlay } from "./player-overlay";
import { ShortcutsOverlay } from "./shortcuts-overlay";
import { Footer } from "./footer";
import { MediaCard } from "./media-card";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

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

const TV_RAIL: RailConfig = {
  kind: "tv",
  title: "Live TV",
  subtitle: "Open IPTV channels from the iptv-org index",
  categories: [
    { id: "all", label: "All" },
    { id: "news", label: "News" },
    { id: "movies", label: "Movies" },
    { id: "entertainment", label: "Entertainment" },
    { id: "sports", label: "Sports" },
    { id: "music", label: "Music" },
    { id: "kids", label: "Kids" },
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
  // Featured hero: interleave top films + top books.
  const movies = useShelf("movie", "featured", 8);
  const books = useShelf("book", "popular", 8);
  const favorites = useOnboarding((s) => s.favorites);

  const featured = useMemo(() => {
    const out: Media[] = [];
    const max = Math.max(movies.items.length, books.items.length);
    for (let i = 0; i < max; i++) {
      if (movies.items[i]) out.push(movies.items[i]);
      if (books.items[i]) out.push(books.items[i]);
    }
    return out;
  }, [movies.items, books.items]);

  return (
    <div className="flex min-h-screen flex-col bg-background rise-in">
      <TopBar />
      <main className="flex-1">
        <div id="top" />
        {featured.length > 0 ? (
          <HeroFocusCarousel items={featured} />
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
          <div id="live">
            <CategoryRail config={TV_RAIL} />
          </div>
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
