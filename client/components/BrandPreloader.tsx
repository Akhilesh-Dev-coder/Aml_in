"use client";

import React, { useState, useEffect } from "react";

export default function BrandPreloader() {
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState("INITIALIZING STUDIO...");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    let currentProg = 0;
    
    // Smooth progress simulation synced with asset readiness
    const interval = setInterval(() => {
      const isDocumentReady =
        typeof document !== "undefined" &&
        (document.readyState === "interactive" || document.readyState === "complete");

      // Progress increments smoothly; when ready, swiftly finishes
      const step = isDocumentReady && currentProg > 50
        ? Math.floor(Math.random() * 8) + 6
        : Math.floor(Math.random() * 5) + 3;

      currentProg = Math.min(currentProg + step, 100);
      setProgress(currentProg);

      if (currentProg < 28) {
        setPhaseText("LOADING CINEMA PIPELINE...");
      } else if (currentProg < 65) {
        setPhaseText("COMPILING 3D SHADERS & REELS...");
      } else if (currentProg < 92) {
        setPhaseText("FINALIZING STUDIO ENVIRONMENT...");
      } else {
        setPhaseText("DIRECTOR READY");
      }

      if (currentProg >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoaded(true);
          // Unmount completely from DOM after fade-out transition
          setTimeout(() => {
            setIsMounted(false);
          }, 650);
        }, 160);
      }
    }, 40);

    const handleWindowLoad = () => {
      currentProg = Math.max(currentProg, 82);
    };

    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        handleWindowLoad();
      } else {
        window.addEventListener("load", handleWindowLoad);
      }
    }

    // Safety timeout: 2.2s absolute upper bound
    const safetyTimeout = setTimeout(() => {
      setProgress(100);
      setPhaseText("DIRECTOR READY");
      setIsLoaded(true);
      setTimeout(() => setIsMounted(false), 650);
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimeout);
      if (typeof window !== "undefined") {
        window.removeEventListener("load", handleWindowLoad);
      }
    };
  }, []);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center p-6 select-none transition-all duration-600 ease-out ${
        isLoaded ? "opacity-0 scale-[1.02] pointer-events-none" : "opacity-100 scale-100"
      }`}
      aria-label="Loading AML Studio"
      role="status"
    >
      {/* Ambient Pulsating Golden Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,217,10,0.18)_0%,_rgba(245,217,10,0.03)_50%,_transparent_75%)] blur-3xl pointer-events-none animate-pulse" />

      {/* Center Brand Badge Container */}
      <div className="relative flex flex-col items-center text-center z-10">
        
        {/* Orbital Ring & Logo Frame */}
        <div className="relative mb-6">
          {/* Subtle Rotating Gold Ring */}
          <div className="absolute -inset-2.5 rounded-[2rem] border border-[#F5D90A]/30 animate-[spin_8s_linear_infinite] pointer-events-none" />
          <div className="absolute -inset-1 rounded-3xl border border-[#F5D90A]/50 blur-[2px] pointer-events-none" />

          {/* Logo Badge with aml_logo.svg */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#F5D90A] shadow-[0_0_40px_rgba(245,217,10,0.35)] relative bg-black flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/aml_logo.svg"
              alt="AML Logo"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Live pulsing yellow status dot */}
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5D90A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#F5D90A] border-2 border-[#050505]"></span>
          </span>
        </div>

        {/* Brand Typography */}
        <div className="flex flex-col items-center gap-1 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-[0.2em] text-lg sm:text-xl uppercase text-white">
              AML.IN
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-black bg-[#F5D90A] px-2 py-0.5 rounded font-bold">
              AI DIR
            </span>
          </div>
          <span className="text-[11px] sm:text-xs tracking-[0.25em] uppercase text-zinc-400 font-mono">
            Cinema-Grade AI Commercials
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-48 sm:w-60 h-1 bg-white/10 rounded-full overflow-hidden mb-3.5 relative">
          <div
            className="h-full bg-gradient-to-r from-[#cca43b] via-[#F5D90A] to-[#ffffff] rounded-full transition-all duration-100 ease-out shadow-[0_0_12px_rgba(245,217,10,0.8)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Telemetry Status Line */}
        <div className="flex items-center justify-between w-48 sm:w-60 text-[10px] font-mono text-zinc-500 tracking-wider">
          <span className="truncate max-w-[150px]">{phaseText}</span>
          <span className="text-[#F5D90A] font-semibold">{progress}%</span>
        </div>

      </div>

      {/* Bottom Sub-brand Watermark */}
      <div className="absolute bottom-6 flex items-center gap-2 text-[9px] font-mono uppercase tracking-widest text-zinc-600">
        <span>AML STUDIO ARCHIVE</span>
        <span>&bull;</span>
        <span>EST. 2025</span>
      </div>
    </div>
  );
}
