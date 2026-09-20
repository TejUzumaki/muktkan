"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A thin brand-colored progress bar fixed to the very top of the viewport,
 * showing how far the user has scrolled down the page. A premium detail
 * (like Apple's product pages). Hidden when an overlay is open via z-index.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-[var(--brand)] shadow-[0_0_12px_color-mix(in_oklch,var(--brand)_60%,transparent)]"
      aria-hidden
    />
  );
}
