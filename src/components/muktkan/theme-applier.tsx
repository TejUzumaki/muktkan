"use client";

import { useEffect } from "react";
import { useOnboarding } from "@/lib/store";

/** Applies the chosen accent + theme to the document root. */
export function ThemeApplier() {
  const accent = useOnboarding((s) => s.accent);
  const theme = useOnboarding((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--brand", accent);
    // --brand-soft and --ring derive from --brand via color-mix in CSS.
  }, [accent]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return null;
}
