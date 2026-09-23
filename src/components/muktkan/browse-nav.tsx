"use client";

import { motion } from "framer-motion";
import { Film, BookOpen, Radio, Heart, History, Sparkles } from "lucide-react";

/**
 * "Browse the Hall" — a compact row of large quick-nav tiles that jump to the
 * relevant section. Gives the top of the page a premium "lobby directory"
 * feel and improves discoverability of the three shelves + library.
 */
const NAV = [
  { id: "movies", label: "Films", desc: "Cinema", icon: Film },
  { id: "books", label: "Books", desc: "Gutenberg literature", icon: BookOpen },
  { id: "live", label: "Live TV", desc: "Open IPTV channels", icon: Radio },
  { id: "library", label: "Library", desc: "Your saved titles", icon: Heart },
];

export function BrowseNav() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 brand-text" />
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Browse the Hall
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {NAV.map((n, i) => {
          const Icon = n.icon;
          return (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              onClick={() => scrollTo(n.id)}
              className="group relative overflow-hidden rounded-2xl border border-border/60 glass p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--brand)]/40 hover:brand-glow"
            >
              <div
                className="absolute -right-6 -top-6 h-20 w-20 rounded-full opacity-15 blur-2xl transition-opacity group-hover:opacity-30"
                style={{ background: "var(--brand)" }}
              />
              <span
                className="relative grid h-10 w-10 place-items-center rounded-xl text-[var(--brand-foreground)] shadow"
                style={{ background: "var(--brand)" }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="relative mt-3 text-sm font-semibold">{n.label}</p>
              <p className="relative mt-0.5 text-[11px] text-muted-foreground">{n.desc}</p>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
