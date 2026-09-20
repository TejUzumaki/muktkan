"use client";

import { MuktkanMark } from "./onboarding";
import { Film, BookOpen, Radio, Heart, ExternalLink, ShieldCheck, Github, ArrowUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden border-t border-border/60 bg-background/60">
      {/* Subtle brand ambient glow */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[60%] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--brand)" }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <MuktkanMark size={30} />
              <div className="leading-tight">
                <p className="text-base font-semibold tracking-tight">Muktkan</p>
                <p className="-mt-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">मुक्त 館</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The Hall of Liberated Media. A premium front door to one hundred percent legal,
              open-source and public-domain work — films, books and live channels, curated to be
              respected rather than skimmed.
            </p>
            {/* Open-source badge */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-[var(--brand)]/10 px-3 py-1.5 text-xs font-medium brand-text">
              <Github className="h-3.5 w-3.5" />
              Open-source · built to preserve
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
            <FooterCol title="Shelves">
              <FooterLink href="#movies" icon={<Film className="h-3.5 w-3.5" />}>Films</FooterLink>
              <FooterLink href="#books" icon={<BookOpen className="h-3.5 w-3.5" />}>Books</FooterLink>
              <FooterLink href="#live" icon={<Radio className="h-3.5 w-3.5" />}>Live TV</FooterLink>
              <FooterLink href="#library" icon={<Heart className="h-3.5 w-3.5" />}>Library</FooterLink>
            </FooterCol>
            <FooterCol title="Sources">
              <FooterExtLink href="https://archive.org">Internet Archive</FooterExtLink>
              <FooterExtLink href="https://www.gutenberg.org">Project Gutenberg</FooterExtLink>
              <FooterExtLink href="https://iptv-org.github.io">iptv-org</FooterExtLink>
            </FooterCol>
            <FooterCol title="Promise">
              <PromiseRow icon={<ShieldCheck className="h-3.5 w-3.5" />} text="100% legal" />
              <PromiseRow icon={<ShieldCheck className="h-3.5 w-3.5" />} text="Public domain" />
              <PromiseRow icon={<Github className="h-3.5 w-3.5" />} text="Open source" />
            </FooterCol>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Muktkan · A cultural preservation interface.</p>
          <div className="flex items-center gap-4">
            <p className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
              No subscription. No tracking. No ads.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 transition hover:bg-card/60 hover:text-foreground"
            >
              <ArrowUp className="h-3 w-3" /> Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">{title}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FooterLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <a href={href} className="flex items-center gap-2 text-muted-foreground transition hover:text-foreground">
      {icon && <span className="text-muted-foreground/70">{icon}</span>}
      {children}
    </a>
  );
}

function FooterExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1.5 text-muted-foreground transition hover:text-foreground"
    >
      {children}
      <ExternalLink className="h-3 w-3 opacity-60" />
    </a>
  );
}

function PromiseRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p className="flex items-center gap-2 text-muted-foreground">
      <span className="brand-text">{icon}</span>
      {text}
    </p>
  );
}
