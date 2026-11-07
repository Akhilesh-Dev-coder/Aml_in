"use client";

import React, { useEffect, useRef } from "react";

interface TinyLight {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  phase: number;
  pulseSpeed: number;
  vy: number;
}

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Pre-render a tiny glow sprite canvas once to eliminate 22 allocations per frame
    const spriteCanvas = document.createElement("canvas");
    spriteCanvas.width = 32;
    spriteCanvas.height = 32;
    const sCtx = spriteCanvas.getContext("2d");
    if (sCtx) {
      const g = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      g.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      g.addColorStop(0.3, "rgba(245, 217, 10, 0.7)");
      g.addColorStop(1, "rgba(245, 217, 10, 0)");
      sCtx.fillStyle = g;
      sCtx.fillRect(0, 0, 32, 32);
    }

    // Only a small handful of tiny yellow lights scattered randomly (not everywhere)
    const count = 22;
    const lights: TinyLight[] = [];

    for (let i = 0; i < count; i++) {
      lights.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.8, // Tiny 0.8px - 2.3px
        baseAlpha: Math.random() * 0.35 + 0.15, // Subtle, soft opacity
        alpha: 0.3,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.015 + 0.008, // Very slow, calm twinkle
        vy: -(Math.random() * 0.08 + 0.03), // Barely perceptible float
      });
    }

    const handleResize = () => {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      const isMobile = window.innerWidth < 768;
      // Ignore mobile address bar collapse/expand during scrolling (typically 40-90px)
      if (Math.abs(newW - width) < 12 && (isMobile ? Math.abs(newH - height) < 160 : Math.abs(newH - height) < 40)) {
        return;
      }
      width = canvas.width = newW;
      height = canvas.height = newH;
    };

    window.addEventListener("resize", handleResize);

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < lights.length; i++) {
        const p = lights[i];

        if (!prefersReducedMotion) {
          p.y += p.vy;
          p.phase += p.pulseSpeed;

          // Wrap edges very quietly
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }

        // Soft, gentle breathing twinkle
        const pulse = Math.sin(p.phase);
        p.alpha = Math.max(0.1, p.baseAlpha + pulse * 0.18);

        // Blit pre-rendered sprite with GPU acceleration (0 allocations, 0 GC pauses)
        ctx.globalAlpha = p.alpha;
        const r = p.size * 3.5;
        ctx.drawImage(spriteCanvas, p.x - r, p.y - r, r * 2, r * 2);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
