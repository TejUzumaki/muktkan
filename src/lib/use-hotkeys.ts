"use client";

import { useEffect } from "react";
import { useViewer } from "@/lib/viewer-store";

/**
 * Global keyboard shortcuts for Muktkan. Only active on the home screen
 * (when no overlay is open and no input is focused):
 *   J        — previous hero title
 *   K        — next hero title
 *   S        — surprise me (random hero title)
 *   Enter    — play/read the focused hero title
 *   I        — open details for the focused hero title
 *   /        — focus the search box
 *   ?        — toggle the shortcuts cheatsheet
 * Esc is handled by each overlay itself.
 */
export function useHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = useViewer.getState();
      // If any overlay is open, let it handle keys (Esc etc).
      if (v.details || v.player || v.onboardingOpen || v.shortcutsOpen || v.searchFullOpen || v.collection) return;

      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const typing =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (t as HTMLElement)?.isContentEditable;
      if (typing) return;

      const k = e.key;
      if (k === "/") {
        e.preventDefault();
        v.openSearchFull();
        return;
      }
      if (k === "?") {
        e.preventDefault();
        v.setShortcutsOpen(!v.shortcutsOpen);
        return;
      }
      if (k === "j" || k === "J") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("muktkan:hero-prev"));
        return;
      }
      if (k === "k" || k === "K") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("muktkan:hero-next"));
        return;
      }
      if (k === "s" || k === "S") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("muktkan:hero-shuffle"));
        return;
      }
      if (k === "Enter") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("muktkan:hero-play"));
        return;
      }
      if (k === "i" || k === "I") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("muktkan:hero-details"));
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
