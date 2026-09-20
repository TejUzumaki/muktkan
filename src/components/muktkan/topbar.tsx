"use client";

import { useEffect, useRef, useState } from "react";
import { useOnboarding } from "@/lib/store";
import { useViewer } from "@/lib/viewer-store";
import { AvatarArt } from "@/lib/avatars";
import { MuktkanMark } from "./onboarding";
import { cn } from "@/lib/utils";
import { Search, Moon, Sun, ChevronDown, Pencil, Heart, X, Keyboard } from "lucide-react";

export function TopBar() {
  const profile = useOnboarding((s) => s.profile);
  const theme = useOnboarding((s) => s.theme);
  const setTheme = useOnboarding((s) => s.setTheme);
  const openOnboarding = useViewer((s) => s.openOnboarding);
  const favorites = useOnboarding((s) => s.favorites);

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 transition-all duration-300",
        scrolled ? "glass-strong border-b border-border/60" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <MuktkanMark size={32} />
          <div className="leading-tight">
            <p className="text-base font-semibold tracking-tight">Muktkan</p>
            <p className="-mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">मुक्त 館</p>
          </div>
        </a>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {[
            { href: "#movies", label: "Films" },
            { href: "#books", label: "Books" },
            { href: "#live", label: "Live TV" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-card/60 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <SearchBox />
          <button
            onClick={() => useViewer.getState().setShortcutsOpen(true)}
            aria-label="Keyboard shortcuts"
            title="Keyboard shortcuts (?)"
            className="hidden h-10 w-10 place-items-center rounded-full border border-border bg-card/40 text-foreground backdrop-blur transition hover:bg-card/80 sm:grid"
          >
            <Keyboard className="h-4 w-4" />
          </button>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card/40 text-foreground backdrop-blur transition hover:bg-card/80"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <ProfileChip
            name={profile.name}
            kind={profile.avatarKind}
            seed={profile.avatarSeed}
            favCount={favorites.length}
            onEdit={openOnboarding}
          />
        </div>
      </div>
    </header>
  );
}

function SearchBox() {
  const openSearchFull = useViewer((s) => s.openSearchFull);

  return (
    <button
      onClick={openSearchFull}
      className="flex items-center gap-2 rounded-full border border-border bg-card/50 px-3.5 py-2 text-sm text-muted-foreground backdrop-blur transition hover:bg-card/80 sm:w-64 md:w-72"
      aria-label="Search the Hall"
    >
      <Search className="h-4 w-4" />
      <span className="flex-1 text-left">Search films & books…</span>
      <kbd className="hidden rounded border border-border bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
        /
      </kbd>
    </button>
  );
}

function ProfileChip({
  name,
  kind,
  seed,
  favCount,
  onEdit,
}: {
  name: string;
  kind: number;
  seed: number;
  favCount: number;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-border bg-card/40 p-1 pr-2 backdrop-blur transition hover:bg-card/80"
      >
        <span className="h-8 w-8 overflow-hidden rounded-full">
          <AvatarArt kind={kind} seed={seed} size={64} className="h-full w-full" />
        </span>
        <span className="hidden text-sm font-medium sm:block">{name}</span>
        <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-border glass-strong p-2 shadow-2xl">
          <div className="flex items-center gap-3 p-2">
            <span className="h-12 w-12 overflow-hidden rounded-full">
              <AvatarArt kind={kind} seed={seed} size={96} className="h-full w-full" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="text-xs text-muted-foreground">{favCount} in library</p>
            </div>
          </div>
          <div className="my-1.5 h-px bg-border" />
          <button
            onClick={() => { setOpen(false); onEdit(); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-card/70"
          >
            <Pencil className="h-4 w-4 text-muted-foreground" /> Re-personalize
          </button>
          <a
            href="#library"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-card/70"
          >
            <Heart className="h-4 w-4 text-muted-foreground" /> My library
          </a>
        </div>
      )}
    </div>
  );
}
