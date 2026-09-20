"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/lib/store";
import { ACCENT_PRESETS, hexToOklch } from "@/lib/palette";
import { AvatarArt, AVATAR_KINDS } from "@/lib/avatars";
import type { ReadingOrientation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Shuffle, Check, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";

interface AvatarPick {
  kind: number;
  seed: number;
}

function randAvatar(i: number): AvatarPick {
  return {
    kind: (i + Math.floor(Math.random() * AVATAR_KINDS)) % AVATAR_KINDS,
    seed: Math.floor(Math.random() * 99999),
  };
}

export function Onboarding() {
  const complete = useOnboarding((s) => s.completeOnboarding);
  const profile = useOnboarding((s) => s.profile);
  const setProfile = useOnboarding((s) => s.setProfile);
  const accent = useOnboarding((s) => s.accent);
  const accentName = useOnboarding((s) => s.accentName);
  const setAccent = useOnboarding((s) => s.setAccent);
  const orientation = useOnboarding((s) => s.orientation);
  const setOrientation = useOnboarding((s) => s.setOrientation);

  const [step, setStep] = useState(0);
  const [avatars, setAvatars] = useState<AvatarPick[]>(() =>
    Array.from({ length: 8 }).map((_, i) => randAvatar(i))
  );
  const [picked, setPicked] = useState<AvatarPick>(
    () => ({ kind: profile.avatarKind, seed: profile.avatarSeed })
  );
  const [name, setName] = useState(profile.name);
  const [customHex, setCustomHex] = useState("#ff7a45");

  const steps = ["Identity", "Accent", "Reading"];

  function shuffleAvatars() {
    setAvatars(Array.from({ length: 8 }).map((_, i) => randAvatar(i)));
  }

  function next() {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setProfile({ avatarSeed: picked.seed, avatarKind: picked.kind, name: name.trim() || "Curator" });
      complete();
    }
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  const canContinue =
    step === 0 ? name.trim().length > 0 :
    step === 1 ? !!accent :
    true;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background text-foreground">
      {/* Ambient brand glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 18%, color-mix(in oklch, var(--brand) 28%, transparent), transparent 70%), radial-gradient(40% 40% at 88% 88%, color-mix(in oklch, var(--brand) 16%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MuktkanMark />
            <div>
              <p className="text-lg font-semibold tracking-tight">Muktkan</p>
              <p className="-mt-1 text-xs text-muted-foreground">मुक्त 館 · Hall of Liberated Media</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-500",
                    i === step ? "w-8 bg-[var(--brand)]" : i < step ? "w-5 bg-[var(--brand)]/60" : "w-5 bg-muted-foreground/25"
                  )}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex-1">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="identity"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Choose your face.</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Every curator needs a sigil. Pick one of the generative avatars — shuffle until it feels like yours.
                </p>

                <div className="mt-6">
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Curator name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={24}
                    placeholder="What should we call you?"
                    className="mt-2 w-full max-w-md rounded-xl border border-border bg-card/60 px-4 py-3 text-lg outline-none backdrop-blur transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/30"
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your avatar</span>
                  <button
                    onClick={shuffleAvatars}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:bg-card"
                  >
                    <Shuffle className="h-3.5 w-3.5" /> Shuffle
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-4">
                  {avatars.map((a, i) => {
                    const selected = picked.kind === a.kind && picked.seed === a.seed;
                    return (
                      <button
                        key={`${a.kind}-${a.seed}-${i}`}
                        onClick={() => setPicked(a)}
                        className={cn(
                          "relative aspect-square overflow-hidden rounded-2xl transition-all duration-300",
                          selected ? "brand-ring scale-[0.97]" : "hover:scale-[1.02] ring-1 ring-border"
                        )}
                      >
                        <AvatarArt kind={a.kind} seed={a.seed} size={160} className="h-full w-full" />
                        {selected && (
                          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-white shadow">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="accent"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Choose the room's light.</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Your accent tints every glow, ring and playback surface across the Hall. The whole app recolors instantly.
                </p>

                <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6">
                  {ACCENT_PRESETS.map((p) => {
                    const selected = accent === p.brand;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setAccent(p.brand, p.name, false)}
                        className={cn(
                          "group relative flex flex-col items-center gap-2 rounded-2xl p-2 transition",
                          selected ? "brand-ring bg-card/50" : "hover:bg-card/40"
                        )}
                      >
                        <span
                          className="h-12 w-12 rounded-full shadow-inner transition group-hover:scale-105"
                          style={{ background: p.swatch }}
                        />
                        <span className="text-[11px] font-medium text-muted-foreground">{p.name}</span>
                        {selected && (
                          <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[var(--brand)] text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom color */}
                <div className="mt-6 rounded-2xl border border-border bg-card/50 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 brand-text" /> Custom accent
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <label className="relative h-14 w-14 cursor-pointer overflow-hidden rounded-xl ring-1 ring-border">
                      <input
                        type="color"
                        value={customHex}
                        onChange={(e) => {
                          setCustomHex(e.target.value);
                          setAccent(hexToOklch(e.target.value), "Custom", true);
                        }}
                        className="absolute -inset-2 h-[120%] w-[120%] cursor-pointer"
                      />
                    </label>
                    <div className="flex-1">
                      <input
                        value={customHex}
                        onChange={(e) => {
                          const v = e.target.value;
                          setCustomHex(v);
                          if (/^#?[0-9a-fA-F]{6}$/.test(v) || /^#?[0-9a-fA-F]{3}$/.test(v)) {
                            const hex = v.startsWith("#") ? v : `#${v}`;
                            setAccent(hexToOklch(hex), "Custom", true);
                          }
                        }}
                        placeholder="#ff7a45"
                        className="w-full max-w-[220px] rounded-lg border border-border bg-background/60 px-3 py-2 font-mono text-sm outline-none focus:border-[var(--brand)]"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">Pick any hex — the entire Hall re-themes.</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Active</p>
                      <p className="text-sm font-medium brand-text">{accentName}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="reading"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">How do you read?</h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Your reading orientation shapes every book inside the Hall — choose the surface that feels right.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {ORIENTATIONS.map((o) => {
                    const selected = orientation === o.id;
                    return (
                      <button
                        key={o.id}
                        onClick={() => setOrientation(o.id)}
                        className={cn(
                          "group relative overflow-hidden rounded-2xl border p-4 text-left transition",
                          selected ? "border-[var(--brand)] bg-card/60 brand-glow" : "border-border bg-card/40 hover:bg-card/60"
                        )}
                      >
                        <div className="mb-3 h-24 overflow-hidden rounded-xl bg-background/70">
                          {o.preview}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{o.title}</p>
                            <p className="text-xs text-muted-foreground">{o.desc}</p>
                          </div>
                          {selected && (
                            <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--brand)] text-white">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="sticky bottom-0 mt-8 flex items-center justify-between gap-3 bg-gradient-to-t from-background via-background/90 to-transparent pb-2 pt-4">
          <button
            onClick={back}
            disabled={step === 0}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition",
              step === 0 ? "opacity-0" : "hover:bg-card/60"
            )}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</span>
            <button
              onClick={next}
              disabled={!canContinue}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition",
                canContinue
                  ? "bg-[var(--brand)] text-[var(--brand-foreground)] shadow-lg hover:brightness-110"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              {step === 2 ? "Enter the Hall" : "Continue"}
              {step === 2 ? <Sparkles className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ORIENTATIONS: {
  id: ReadingOrientation;
  title: string;
  desc: string;
  preview: React.ReactNode;
}[] = [
  {
    id: "scroll",
    title: "Continuous scroll",
    desc: "One long page",
    preview: (
      <div className="flex h-full gap-2 p-2">
        <div className="w-3 rounded bg-[var(--brand)]/30" />
        <div className="flex-1 space-y-1.5 py-1">
          <div className="h-1.5 w-3/4 rounded bg-foreground/30" />
          <div className="h-1.5 w-full rounded bg-foreground/15" />
          <div className="h-1.5 w-5/6 rounded bg-foreground/15" />
          <div className="h-1.5 w-2/3 rounded bg-foreground/15" />
        </div>
      </div>
    ),
  },
  {
    id: "paginated",
    title: "Paginated",
    desc: "Turn each page",
    preview: (
      <div className="relative h-full p-2">
        <div className="flex h-full gap-1">
          <div className="flex-1 rounded-l-lg bg-foreground/10" />
          <div className="w-px bg-foreground/20" />
          <div className="flex-1 rounded-r-lg bg-foreground/10" />
        </div>
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--brand)]/80 shadow" />
      </div>
    ),
  },
  {
    id: "sepia",
    title: "Sepia calm",
    desc: "Warm, low-glare",
    preview: (
      <div className="h-full p-2" style={{ background: "oklch(0.9 0.04 70)" }}>
        <div className="h-full space-y-1.5 rounded-lg bg-[oklch(0.94_0.05_70)] p-2">
          <div className="h-1.5 w-1/2 rounded bg-[oklch(0.4_0.08_60)]" />
          <div className="h-1.5 w-full rounded bg-[oklch(0.45_0.06_60)]/70" />
          <div className="h-1.5 w-5/6 rounded bg-[oklch(0.45_0.06_60)]/70" />
        </div>
      </div>
    ),
  },
];

export function MuktkanMark({ size = 34 }: { size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-xl text-[var(--brand-foreground)] shadow-lg"
      style={{
        width: size,
        height: size,
        background: "var(--brand)",
        boxShadow: "0 8px 30px -8px color-mix(in oklch, var(--brand) 70%, transparent)",
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
        <path d="M5 4h11a3 3 0 0 1 3 3v13l-4-2.4-4 2.4-4-2.4-4 2.4V4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M9 9.5h6M9 12.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
