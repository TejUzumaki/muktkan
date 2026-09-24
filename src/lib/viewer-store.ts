"use client";

import { create } from "zustand";
import type { Media, TvChannel } from "./types";
import { useOnboarding } from "./store";
import type { Collection } from "./collections";

interface ViewerState {
  details: Media | null;
  player: Media | null;

  tvMode: boolean;
  tvChannel: TvChannel | null;

  searchOpen: boolean;
  searchQuery: string;
  searchFullOpen: boolean;
  onboardingOpen: boolean;
  shortcutsOpen: boolean;
  collection: Collection | null;

  openDetails: (m: Media) => void;
  closeDetails: () => void;
  openPlayer: (m: Media) => void;
  closePlayer: () => void;

  openTv: (channel: TvChannel) => void;
  closeTv: () => void;

  setSearch: (q: string) => void;
  setSearchOpen: (open: boolean) => void;
  openSearchFull: () => void;
  closeSearchFull: () => void;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  setShortcutsOpen: (open: boolean) => void;
  openCollection: (c: Collection) => void;
  closeCollection: () => void;
}

export const useViewer = create<ViewerState>()((set) => ({
  details: null,
  player: null,

  tvMode: false,
  tvChannel: null,

  searchOpen: false,
  searchQuery: "",
  searchFullOpen: false,
  onboardingOpen: false,
  shortcutsOpen: false,
  collection: null,

  openDetails: (m) => {
    set({ details: m });
    useOnboarding.getState().pushRecentlyViewed(m);
    document.body.style.overflow = "hidden";
  },

  closeDetails: () => {
    set({ details: null });
    if (
      !useViewer.getState().player &&
      !useViewer.getState().tvMode &&
      !useViewer.getState().collection &&
      !useViewer.getState().searchFullOpen
    ) {
      document.body.style.overflow = "";
    }
  },

  openPlayer: (m) => {
    set({
      player: m,
      details: null,
      tvMode: false,
      tvChannel: null,
    });
    useOnboarding.getState().pushRecentlyViewed(m);
    document.body.style.overflow = "hidden";
  },

  closePlayer: () => {
    set({ player: null });
    if (
      !useViewer.getState().details &&
      !useViewer.getState().tvMode &&
      !useViewer.getState().collection &&
      !useViewer.getState().searchFullOpen
    ) {
      document.body.style.overflow = "";
    }
  },

  openTv: (channel) => {
    set({
      tvMode: true,
      tvChannel: channel,
      player: null,
      details: null,
    });
    useOnboarding.getState().pushRecentlyViewed(channel);
    document.body.style.overflow = "hidden";
  },

  closeTv: () => {
    set({
      tvMode: false,
      tvChannel: null,
    });

    if (
      !useViewer.getState().details &&
      !useViewer.getState().player &&
      !useViewer.getState().collection &&
      !useViewer.getState().searchFullOpen
    ) {
      document.body.style.overflow = "";
    }
  },

  setSearch: (q) => set({
    searchQuery: q,
    searchOpen: q.trim().length > 0,
  }),

  setSearchOpen: (open) => set({ searchOpen: open }),

  openSearchFull: () => {
    set({ searchFullOpen: true });
    document.body.style.overflow = "hidden";
  },

  closeSearchFull: () => {
    set({ searchFullOpen: false });
    if (
      !useViewer.getState().details &&
      !useViewer.getState().player &&
      !useViewer.getState().collection &&
      !useViewer.getState().tvMode
    ) {
      document.body.style.overflow = "";
    }
  },

  openOnboarding: () => {
    set({ onboardingOpen: true });
    document.body.style.overflow = "hidden";
  },

  closeOnboarding: () => {
    set({ onboardingOpen: false });
    document.body.style.overflow = "";
  },

  setShortcutsOpen: (shortcutsOpen) => set({ shortcutsOpen }),

  openCollection: (c) => {
    set({ collection: c });
    document.body.style.overflow = "hidden";
  },

  closeCollection: () => {
    set({ collection: null });
    if (
      !useViewer.getState().details &&
      !useViewer.getState().player &&
      !useViewer.getState().tvMode
    ) {
      document.body.style.overflow = "";
    }
  },
}));
