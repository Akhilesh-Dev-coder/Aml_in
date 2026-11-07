"use client";

import React from "react";
import Image from "next/image";
import { Sparkles, CheckCircle2, Globe, Cpu, Clapperboard, Award } from "lucide-react";

export default function AboutPhilosophy() {
  return (
    <section id="about" className="py-16 sm:py-28 lg:py-32 border-t border-white/[0.08] relative overflow-hidden bg-[#080808]/40 backdrop-blur-[2px]">
      {/* Background radial glow */}
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-[#F5D90A]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 text-xs uppercase font-mono tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#F5D90A]" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white leading-tight mb-4">
            Direct Direction. <br />
            <span className="text-[#F5D90A] font-normal italic font-serif">Real Results.</span>
          </h2>
          <p className="text-xs sm:text-base text-zinc-400 font-light leading-relaxed">
            We help brands create commercials that look amazing and sell, without the agency runaround.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Simple Story & Principles */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="text-zinc-300 font-light leading-relaxed text-xs sm:text-base space-y-3 sm:space-y-4">
              <p>
                Traditional video shoots take months, cost too much, and get slowed down by too many meetings and middlemen. Your creative vision easily gets lost along the way.
              </p>
              <p>
                By combining film direction with advanced AI tools, we deliver ready-to-air commercial videos in days instead of months.
              </p>
            </div>

            {/* Pillar Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5 pt-2">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-white/[0.08] hover:border-[#F5D90A]/30 active:border-[#F5D90A]/40 shadow-sm transition-all">
                <div className="w-8 h-8 rounded-xl bg-[#F5D90A]/10 border border-[#F5D90A]/20 flex items-center justify-center text-[#F5D90A] mb-2.5 shadow-sm">
                  <Clapperboard className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">Direct Contact</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Work straight with the director. No middlemen or extra fees.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-white/[0.08] hover:border-[#F5D90A]/30 active:border-[#F5D90A]/40 shadow-sm transition-all">
                <div className="w-8 h-8 rounded-xl bg-[#F5D90A]/10 border border-[#F5D90A]/20 flex items-center justify-center text-[#F5D90A] mb-2.5 shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">Top Quality</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Ultra-sharp 4K video, realistic lighting, and clean motion.
                </p>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#141414] to-[#0d0d0d] border border-white/[0.08] hover:border-[#F5D90A]/30 active:border-[#F5D90A]/40 shadow-sm transition-all">
                <div className="w-8 h-8 rounded-xl bg-[#F5D90A]/10 border border-[#F5D90A]/20 flex items-center justify-center text-[#F5D90A] mb-2.5 shadow-sm">
                  <Globe className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">Fast Delivery</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Fast turnaround for brands worldwide, delivered on schedule.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Director Identity Dossier */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#161616] via-[#111111] to-[#0a0a0a] border border-white/10 p-5 xs:p-6 sm:p-7 shadow-[0_20px_70px_rgba(0,0,0,0.85)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#F5D90A]/40 to-transparent" />
              
              {/* Director Dossier Header */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/[0.08]">
                {/* Director Avatar Badge with Brand Logo */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#F5D90A]/40 group-hover:border-[#F5D90A] ring-4 ring-black/70 shadow-[0_0_25px_rgba(245,217,10,0.25)] relative bg-black transition-all duration-500">
                    <Image
                      src="/images/aml_logo.svg"
                      alt="Director AML"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {/* Verified Director Star Badge */}
                  <div
                    className="absolute -bottom-1 -right-1 bg-[#F5D90A] text-black rounded-full p-1 border-2 border-[#0a0a0a] shadow-lg"
                    title="Verified Commercial Director"
                  >
                    <Sparkles className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5D90A] bg-[#F5D90A]/10 border border-[#F5D90A]/20 px-2 py-0.5 rounded-full font-medium">
                      DIRECTOR PROFILE
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      // ID: AML-01
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight leading-snug">
                    AML
                  </h3>
                  <p className="text-xs text-zinc-400 font-light mt-0.5 leading-relaxed">
                    AI Commercial Director &amp; Cinematic Visual Designer.
                  </p>
                </div>
              </div>

              {/* Status & Availability Bar */}
              <div className="flex items-center justify-between mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5D90A] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5D90A]"></span>
                  </span>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Status: <span className="text-white font-medium">Open for Projects</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase text-[#F5D90A] bg-[#F5D90A]/10 px-2.5 py-0.5 rounded-full border border-[#F5D90A]/20">
                  Direct Direction
                </span>
              </div>

              {/* Workflow Standards */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F5D90A] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-zinc-300 font-light">
                    Concept frames and visual moodboard delivered in 48 hours
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F5D90A] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-zinc-300 font-light">
                    Direct revisions with director on lighting, pacing, and sound
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#F5D90A] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-zinc-300 font-light">
                    Full commercial buyout rights &amp; master delivery in 16:9 + 9:16
                  </p>
                </div>
              </div>

              {/* Turnaround & Master Specs Bar */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-0">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Turnaround Time
                  </span>
                  <span className="text-xs font-mono text-[#F5D90A] font-medium">
                    5 - 10 Business Days
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                    Master Delivery
                  </span>
                  <span className="text-xs font-mono text-white">
                    4K Ultra HD &bull; Cinema Master
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
