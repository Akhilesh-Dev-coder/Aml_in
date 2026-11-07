import React from "react";
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center p-6 select-none">
      {/* Ambient Pulsating Golden Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[500px] h-[340px] sm:h-[500px] rounded-full bg-[radial-gradient(circle_at_center,_rgba(245,217,10,0.18)_0%,_rgba(245,217,10,0.03)_50%,_transparent_75%)] blur-3xl pointer-events-none animate-pulse" />

      {/* Center Brand Badge Container */}
      <div className="relative flex flex-col items-center text-center z-10">
        
        {/* Orbital Ring & Logo Frame */}
        <div className="relative mb-6">
          <div className="absolute -inset-2.5 rounded-[2rem] border border-[#F5D90A]/30 animate-[spin_8s_linear_infinite] pointer-events-none" />
          <div className="absolute -inset-1 rounded-3xl border border-[#F5D90A]/50 blur-[2px] pointer-events-none" />

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

        {/* Animated Indeterminate Progress Line */}
        <div className="w-48 sm:w-60 h-1 bg-white/10 rounded-full overflow-hidden mb-3.5 relative">
          <div className="h-full bg-gradient-to-r from-[#cca43b] via-[#F5D90A] to-[#ffffff] rounded-full animate-[pulse_1s_ease-in-out_infinite] w-full" />
        </div>

        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
          LOADING CINEMA REEL...
        </span>

      </div>
    </div>
  );
}
