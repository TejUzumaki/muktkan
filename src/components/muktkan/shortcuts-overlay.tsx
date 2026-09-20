"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useViewer } from "@/lib/viewer-store";
import { X, Command } from "lucide-react";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["J"], label: "Previous title in hero" },
  { keys: ["K"], label: "Next title in hero" },
  { keys: ["S"], label: "Surprise me — random title" },
  { keys: ["Enter"], label: "Play / Read the focused title" },
  { keys: ["I"], label: "Open details for the focused title" },
  { keys: ["/"], label: "Focus search" },
  { keys: ["Esc"], label: "Close any overlay" },
  { keys: ["?"], label: "Toggle this cheatsheet" },
];

export function ShortcutsOverlay() {
  const open = useViewer((s) => s.shortcutsOpen);
  const setOpen = useViewer((s) => s.setShortcutsOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4 backdrop-blur-md"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: 14, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 8, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border glass-strong p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Command className="h-5 w-5 brand-text" />
                <h2 className="text-lg font-semibold tracking-tight">Keyboard shortcuts</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card/60 transition hover:bg-card"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="divide-y divide-border">
              {SHORTCUTS.map((s) => (
                <li key={s.label} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd
                        key={k}
                        className="min-w-[1.75rem] rounded-md border border-border bg-card px-2 py-1 text-center font-mono text-xs font-semibold text-foreground shadow-sm"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              Press <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">?</kbd> anytime to bring this back.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
