"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapHeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context((self) => {
      const q = gsap.utils.selector(containerRef);

      if (q(".hero-title").length) {
        gsap.fromTo(
          q(".hero-title"),
          { opacity: 0.6, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.05, ease: "power3.out" }
        );
      }

      if (q(".hero-desc").length) {
        gsap.fromTo(
          q(".hero-desc"),
          { opacity: 0.6, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, delay: 0.1, ease: "power2.out" }
        );
      }

      if (q(".hero-cta").length) {
        gsap.fromTo(
          q(".hero-cta"),
          { opacity: 0.7, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, delay: 0.12, ease: "power2.out" }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}
