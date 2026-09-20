"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Media, ReadingOrientation } from "./types";

interface OnboardingState {
  onboarded: boolean;
  profile: { name: string; avatarSeed: number; avatarKind: number };
  /** OKLCH string for the --brand variable. */
  accent: string;
  accentName: string;
  accentIsCustom: boolean;
  orientation: ReadingOrientation;
  theme: "dark" | "light";
  favorites: Media[];
  /** Most-recently-opened items (details or player), newest first, capped. */
  recentlyViewed: Media[];
  /** Reading progress bookmarks: { [bookId]: scrollTopFraction 0..1 }. */
  readingProgress: Record<string, number>;

  setProfile: (p: Partial<OnboardingState["profile"]>) => void;
  setAccent: (accent: string, name: string, isCustom?: boolean) => void;
  setOrientation: (o: ReadingOrientation) => void;
  setTheme: (t: "dark" | "light") => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  toggleFavorite: (media: Media) => void;
  isFavorite: (id: string) => boolean;
  pushRecentlyViewed: (media: Media) => void;
  clearRecentlyViewed: () => void;
  setReadingProgress: (id: string, fraction: number) => void;
  getReadingProgress: (id: string) => number;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      profile: { name: "Curator", avatarSeed: 7, avatarKind: 2 },
      accent: "oklch(0.68 0.19 38)",
      accentName: "Ember",
      accentIsCustom: false,
      orientation: "scroll",
      theme: "dark",
      favorites: [],
      recentlyViewed: [],
      readingProgress: {},

      setProfile: (p) =>
        set((s) => ({ profile: { ...s.profile, ...p } })),
      setAccent: (accent, accentName, accentIsCustom = false) =>
        set({ accent, accentName, accentIsCustom }),
      setOrientation: (orientation) => set({ orientation }),
      setTheme: (theme) => set({ theme }),
      completeOnboarding: () => set({ onboarded: true }),
      resetOnboarding: () => set({ onboarded: false }),
      toggleFavorite: (media) =>
        set((s) => ({
          favorites: s.favorites.some((f) => f.id === media.id)
            ? s.favorites.filter((f) => f.id !== media.id)
            : [...s.favorites, media],
        })),
      isFavorite: (id) => get().favorites.some((f) => f.id === id),
      pushRecentlyViewed: (media) =>
        set((s) => ({
          recentlyViewed: [
            media,
            ...s.recentlyViewed.filter((m) => m.id !== media.id),
          ].slice(0, 16),
        })),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
      setReadingProgress: (id, fraction) =>
        set((s) => ({
          readingProgress: {
            ...s.readingProgress,
            [id]: Math.max(0, Math.min(1, fraction)),
          },
        })),
      getReadingProgress: (id) => get().readingProgress[id] ?? 0,
    }),
    {
      name: "muktkan-onboarding",
      version: 4,
    }
  )
);
