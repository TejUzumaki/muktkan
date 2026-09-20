"use client";

import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Heart, Bookmark, Info, X } from "lucide-react";
import { useEffect } from "react";

type ToastKind = "favorite" | "unfavorite" | "bookmark" | "info";

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastState {
  toasts: Toast[];
  push: (kind: ToastKind, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToast = create<ToastState>()((set) => ({
  toasts: [],
  push: (kind, message) => {
    const id = nextId++;
    set((s) => ({ toasts: [...s.toasts, { id, kind, message }] }));
    // auto-dismiss after 2.8s
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2800);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/** Toast viewport — fixed top-right, renders all active toasts. */
export function ToastViewport() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed right-4 top-16 z-[100] flex w-[min(92vw,22rem)] flex-col gap-2 sm:right-6 sm:top-20">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icon =
    toast.kind === "favorite" ? <Heart className="h-4 w-4 fill-current" /> :
    toast.kind === "unfavorite" ? <Heart className="h-4 w-4" /> :
    toast.kind === "bookmark" ? <Bookmark className="h-4 w-4 fill-current" /> :
    <Info className="h-4 w-4" />;
  const accent = toast.kind === "unfavorite" ? "text-muted-foreground" : "brand-text";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-border glass-strong p-3.5 shadow-xl"
    >
      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[var(--brand)]/12 ${accent}`}>
        {icon}
      </span>
      <p className="flex-1 pt-1 text-sm leading-snug text-foreground">{toast.message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-card/60 hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
