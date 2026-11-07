"use client";

import { useEffect, useState } from "react";

const duration = 300;

export function useSlide(active: boolean) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (active) {
      setMounted(true);
      if (reduce) {
        setShown(true);
        return;
      }
      let second = 0;
      const first = requestAnimationFrame(() => {
        second = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }

    setShown(false);
    if (reduce) {
      setMounted(false);
      return;
    }
    const timeout = window.setTimeout(() => setMounted(false), duration);
    return () => window.clearTimeout(timeout);
  }, [active]);

  return { mounted, shown };
}
