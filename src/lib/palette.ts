import type { AccentPreset } from "./types";

// 12 hand-picked premium accents + a custom slot. Each uses OKLCH for
// perceptual consistency across the dynamic theme.
export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "ember", name: "Ember", brand: "oklch(0.68 0.19 38)", swatch: "oklch(0.68 0.19 38)" },
  { id: "rose", name: "Rose", brand: "oklch(0.65 0.21 12)", swatch: "oklch(0.65 0.21 12)" },
  { id: "magenta", name: "Magenta", brand: "oklch(0.62 0.24 346)", swatch: "oklch(0.62 0.24 346)" },
  { id: "violet", name: "Violet", brand: "oklch(0.62 0.22 300)", swatch: "oklch(0.62 0.22 300)" },
  { id: "iris", name: "Iris", brand: "oklch(0.6 0.2 265)", swatch: "oklch(0.6 0.2 265)" },
  { id: "teal", name: "Teal", brand: "oklch(0.68 0.14 195)", swatch: "oklch(0.68 0.14 195)" },
  { id: "emerald", name: "Emerald", brand: "oklch(0.7 0.18 160)", swatch: "oklch(0.7 0.18 160)" },
  { id: "lime", name: "Lime", brand: "oklch(0.78 0.18 130)", swatch: "oklch(0.78 0.18 130)" },
  { id: "amber", name: "Amber", brand: "oklch(0.8 0.17 80)", swatch: "oklch(0.8 0.17 80)" },
  { id: "gold", name: "Gold", brand: "oklch(0.82 0.14 70)", swatch: "oklch(0.82 0.14 70)" },
  { id: "crimson", name: "Crimson", brand: "oklch(0.56 0.22 27)", swatch: "oklch(0.56 0.22 27)" },
  { id: "graphite", name: "Graphite", brand: "oklch(0.62 0.01 270)", swatch: "oklch(0.62 0.01 270)" },
];

export const DEFAULT_ACCENT = ACCENT_PRESETS[0];

/** Convert any hex color into an OKLCH string suitable for --brand. */
export function hexToOklch(hex: string): string {
  // Parse #rgb or #rrggbb
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) {
    return DEFAULT_ACCENT.brand;
  }
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const { okl, c, hue } = srgbToOklch(r, g, b);
  return `oklch(${okl.toFixed(3)} ${c.toFixed(3)} ${hue.toFixed(1)})`;
}

function srgbToOklch(r: number, g: number, b: number) {
  const lin = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const lr = lin(r);
  const lg = lin(g);
  const lb = lin(b);

  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  const chroma = Math.sqrt(a * a + bb * bb);
  let hue = (Math.atan2(bb, a) * 180) / Math.PI;
  if (hue < 0) hue += 360;
  return { okl: L, c: chroma, hue };
}
