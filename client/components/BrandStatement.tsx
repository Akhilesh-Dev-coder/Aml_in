"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export default function BrandStatement() {
  return (
    <section className="py-16 sm:py-28 lg:py-32 border-t border-b border-white/[0.08] relative overflow-hidden bg-[#0a0a0a]/50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400 text-xs uppercase font-mono tracking-widest mb-6 sm:mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#F5D90A]" />
            <span>Our Approach</span>
          </div>

          <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-light tracking-tight text-white leading-[1.2] mb-6 sm:mb-8">
            We make <span className="text-[#F5D90A] font-normal italic font-serif">AI commercials</span> that grab attention and turn viewers into loyal customers.
          </h2>

          <p className="text-xs sm:text-base md:text-lg text-zinc-400 font-light max-w-2xl leading-relaxed">
            Skip the high costs and slow timelines of traditional agencies. Get high-end, cinema-quality video in days, not months.
          </p>

        </div>
      </div>
    </section>
  );
}
