"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Play,
  ArrowDown,
  Film,
  ShieldCheck,
} from "lucide-react";
import { useGsapHeroAnimation } from "@/lib/useGsapAnimation";
import HeroScene3D from "./HeroScene3D";

interface HeroProps {
  firstProjectSlug?: string;
  onOpenViewer?: (projectIndex: number) => void;
}

export default function Hero({
  firstProjectSlug = "chronos-fluid-precision",
  onOpenViewer,
}: HeroProps) {
  const containerRef = useGsapHeroAnimation();

  return (
    <section
      ref={containerRef}
      className="relative h-[100svh] min-h-[540px] max-h-[100svh] lg:h-screen lg:max-h-[1000px] w-full flex flex-col justify-between overflow-hidden pt-14 xs:pt-16 sm:pt-24 pb-2 sm:pb-7 px-3.5 sm:px-8 select-none"
    >
      {/* Ambient background volumetric glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[550px] lg:w-[750px] h-[340px] sm:h-[550px] lg:h-[750px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,217,10,0.12)_0%,_rgba(245,217,10,0.02)_55%,_transparent_75%)] blur-3xl pointer-events-none z-0" />

      {/* Subtle top & bottom edge vignettes */}
      <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-[#050505] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent pointer-events-none z-10" />

      {/* =========================================================================
          1. TOP ROW: EDITORIAL HEADLINE, SUBTITLE & DUAL CTAS
      ========================================================================= */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto shrink-0 mt-1 sm:mt-3 px-3 sm:px-4">
        {/* Director Status Tag (Mobile & Tablet Only) */}
        <div className="inline-flex lg:hidden items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md mb-2 sm:mb-3 shadow-[0_0_15px_rgba(245,217,10,0.12)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5D90A] animate-ping" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300">
            AML STUDIO <span className="text-[#F5D90A] font-semibold">// COMMERCIAL AI</span>
          </span>
        </div>

        {/* Editorial Headline */}
        <h1 className="hero-title text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal sm:font-light tracking-tight text-white leading-[1.1] sm:leading-[1.05] drop-shadow-md">
          Making brands{" "}
          <span className="text-[#F5D90A] font-medium drop-shadow-[0_0_35px_rgba(245,217,10,0.4)]">
            impossible
          </span>{" "}
          to ignore.
        </h1>

        {/* Compelling Hook Subtitle */}
        <p className="hero-desc text-xs xs:text-sm sm:text-base text-zinc-300 font-normal max-w-lg mx-auto mt-2 sm:mt-3 leading-relaxed drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
          Cinema-grade video ads that sell. Fast turnaround, zero agency delays.
        </p>

        {/* Dual Conversion CTAs */}
        <div className="hero-cta flex flex-row items-center justify-center gap-2.5 sm:gap-3.5 mt-3.5 sm:mt-5 w-full sm:w-auto">
          <Link
            href={`/project/${firstProjectSlug}`}
            prefetch={true}
            className="group inline-flex items-center justify-center gap-2 bg-[#F5D90A] hover:bg-[#ffe32a] text-black font-semibold text-xs tracking-wider uppercase py-2.5 sm:py-3 px-5 sm:px-6 rounded-full transition-all duration-300 hover:scale-[1.03] shadow-[0_0_30px_rgba(245,217,10,0.45)] active:scale-95 text-center whitespace-nowrap"
          >
            <Play className="w-3.5 h-3.5 fill-black shrink-0 transition-transform group-hover:scale-110" />
            <span>View Work</span>
          </Link>

          <Link
            href="#contact"
            className="group inline-flex items-center justify-center gap-2 bg-white/[0.06] hover:bg-white/[0.12] text-white hover:text-[#F5D90A] border border-white/20 hover:border-[#F5D90A]/50 active:scale-95 text-xs font-medium uppercase tracking-wider py-2.5 sm:py-3 px-5 sm:px-6 rounded-full backdrop-blur-md transition-all duration-300 text-center whitespace-nowrap shadow-lg"
          >
            <span>Get in Touch</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-[#F5D90A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </div>

      {/* =========================================================================
          2. CENTER STAGE: THE LIQUID MOLTEN FLUID SPHERE + FLANKING CAPSULES
      ========================================================================= */}
      <div className="relative z-20 flex-1 w-full max-w-6xl mx-auto flex items-center justify-between min-h-0 my-1 sm:my-auto">
        
        {/* Left Floating Micro-Card (Desktop) */}
        <div className="hidden lg:flex flex-col gap-3 w-56 shrink-0 relative z-30">
          <div className="bg-[#111111]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/[0.08]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F5D90A]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-300">
                Direct Direction
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-light leading-snug">
              Direct with the creator. No middlemen. Ready in days.
            </p>
            <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono">
              <span className="text-white font-medium">10X FASTER</span>
              <span className="text-[#F5D90A]">DIRECT DIRECTION</span>
            </div>
          </div>
        </div>

        {/* Central 3D Canvas Container */}
        <div className="relative flex-1 w-full h-[250px] xs:h-[280px] lg:h-auto lg:min-h-[220px] lg:max-h-[440px] flex items-center justify-center mx-auto sm:mx-6 overflow-hidden">
          {/* Viewfinder HUD Corner Accents (Mobile Only) */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-white/20 pointer-events-none z-10 lg:hidden" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-white/20 pointer-events-none z-10 lg:hidden" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-white/20 pointer-events-none z-10 lg:hidden" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-white/20 pointer-events-none z-10 lg:hidden" />

          <div className="absolute top-2.5 left-7 hidden xs:flex lg:hidden items-center gap-1.5 pointer-events-none z-10">
            <span className="text-[8px] font-mono tracking-widest uppercase text-zinc-500">
              FRAME // 24FPS
            </span>
          </div>
          <div className="absolute top-2.5 right-7 hidden xs:flex lg:hidden items-center gap-1 pointer-events-none z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-mono tracking-widest uppercase text-zinc-400">
              CINEMATIC
            </span>
          </div>

          <HeroScene3D className="w-full h-full" />

          {/* Interactive Drag Hint Pill */}
          <div className="absolute bottom-1 sm:bottom-2 flex items-center justify-center pointer-events-none z-10 w-full px-2">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/75 backdrop-blur-md border border-white/10 rounded-full px-3 sm:px-3.5 py-1 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5D90A] animate-ping" />
              <span className="text-[9px] xs:text-[10px] font-mono uppercase tracking-wider text-zinc-300 truncate max-w-[280px]">
                Swipe to orbit &bull; Tap to pulse
              </span>
            </div>
          </div>
        </div>

        {/* Right Floating Micro-Card (Desktop) */}
        <div className="hidden lg:flex flex-col gap-3 w-56 shrink-0 relative z-30">
          <Link
            href="/project/chronos-fluid-precision"
            className="group bg-[#111111]/70 backdrop-blur-xl border border-white/10 hover:border-[#F5D90A]/40 transition-colors rounded-2xl p-4 shadow-xl block"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#F5D90A] flex items-center gap-1.5">
                <Film className="w-3 h-3 text-[#F5D90A]" />
                SPOTLIGHT
              </span>
              <span className="text-[10px] font-mono text-zinc-500">01 // 06</span>
            </div>
            <p className="text-xs font-medium text-white group-hover:text-[#F5D90A] transition-colors truncate">
              CHRONOS // Fluid Precision
            </p>
            <p className="text-[11px] text-zinc-400 font-light mt-0.5">
              Luxury watch in liquid gold.
            </p>
            <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-[#F5D90A]">
              <span>WATCH VIDEO</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>
        </div>

      </div>

      {/* =========================================================================
          2.5. MOBILE CYBERPUNK TELEMETRY DOCK (Adapts Desktop Micro-Cards to Mobile)
      ========================================================================= */}
      <div className="flex lg:hidden items-center justify-between gap-1.5 w-full max-w-xs xs:max-w-sm mx-auto px-2.5 py-1.5 rounded-2xl bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.6)] shrink-0 z-30 mb-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] xs:text-[10px] font-mono text-zinc-300">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5D90A]" />
          <span className="text-white font-medium">10X FASTER</span>
        </div>

        <span className="text-zinc-700 text-xs font-mono">&bull;</span>

        <div className="flex items-center gap-1.5 px-2 py-0.5 text-[9px] xs:text-[10px] font-mono text-zinc-300">
          <span className="text-[#F5D90A] font-semibold">FAST DELIVERY</span>
        </div>

        <span className="text-zinc-700 text-xs font-mono">&bull;</span>

        <Link
          href="/project/chronos-fluid-precision"
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-[#F5D90A]/20 text-[9px] xs:text-[10px] font-mono text-[#F5D90A] border border-[#F5D90A]/30 active:scale-95 transition-all"
        >
          <Film className="w-2.5 h-2.5 text-[#F5D90A]" />
          <span>CHRONOS</span>
          <ArrowUpRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* =========================================================================
          3. BOTTOM DOCK BAR: STUDIO CREDENTIALS & SCROLL INDICATOR
      ========================================================================= */}
      <div className="relative z-20 w-full max-w-6xl mx-auto flex items-center justify-between gap-4 pt-2 sm:pt-3 border-t border-white/[0.08] shrink-0 text-[10px] sm:text-[11px] font-mono text-zinc-400">
        
        {/* Left: Studio Credentials */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5D90A]" />
          <span className="uppercase tracking-widest text-zinc-400 text-[10px] sm:text-[11px]">
            AML &bull; AI COMMERCIALS &bull; STUDIO
          </span>
        </div>

        {/* Right: Scroll to Archive Link */}
        <Link
          href="#work"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-[#F5D90A] transition-colors uppercase tracking-widest group cursor-pointer shrink-0"
        >
          <span>See Work</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#F5D90A] group-hover:translate-y-0.5 transition-transform shrink-0" />
        </Link>

      </div>
    </section>
  );
}
