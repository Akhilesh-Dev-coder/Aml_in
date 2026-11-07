"use client";

import React from "react";
import {
  Sparkles,
  Video,
  Camera,
  Wand2,
  Eye,
  Flame,
} from "lucide-react";

interface Discipline {
  number: string;
  categoryTag: string;
  title: string;
  tagline: string;
  description: string;
  highlights: string[];
  icon: React.ElementType;
  colSpan: string;
}

const DISCIPLINES: Discipline[] = [
  {
    number: "01",
    categoryTag: "PRODUCT COMMERCIALS",
    title: "Product Commercials",
    tagline: "Clean 3D & Fine Details",
    description:
      "Showcase your products in 4K with smooth motion, real reflections, and studio lighting without physical studio costs.",
    highlights: ["4K Quality", "Smooth Motion", "Custom Audio"],
    icon: Video,
    colSpan: "lg:col-span-6",
  },
  {
    number: "02",
    categoryTag: "BRAND FILMS",
    title: "Brand Films",
    tagline: "Cinematic Storytelling",
    description:
      "Tell your brand story with big cinematic visuals that inspire trust and make your company look world-class.",
    highlights: ["Cinema Lighting", "Brand Stories", "Web & TV Ready"],
    icon: Camera,
    colSpan: "lg:col-span-6",
  },
  {
    number: "03",
    categoryTag: "LUXURY & BEAUTY",
    title: "Luxury & Beauty",
    tagline: "Elegant Colors & Textures",
    description:
      "Tailored for perfume, fashion, and beauty labels. Rich colors, delicate textures, and elegant lighting.",
    highlights: ["Rich Colors", "Fabric & Liquid", "Fashion Ads"],
    icon: Wand2,
    colSpan: "lg:col-span-4",
  },
  {
    number: "04",
    categoryTag: "VISUAL EFFECTS",
    title: "Visual Effects & 3D",
    tagline: "Creative Ideas Without Limits",
    description:
      "Create dreamlike scenes, futuristic environments, and visual ideas that would be impossible to shoot on real cameras.",
    highlights: ["3D Worlds", "Custom VFX", "Unique Concepts"],
    icon: Eye,
    colSpan: "lg:col-span-4",
  },
  {
    number: "05",
    categoryTag: "SOCIAL MEDIA ADS",
    title: "Social Media Videos",
    tagline: "Fast Videos That Stop The Scroll",
    description:
      "Fast-paced video ads designed specifically for TikTok, Instagram Reels, and YouTube Shorts to drive clicks.",
    highlights: ["3-Second Hooks", "9:16 Vertical", "High Energy"],
    icon: Flame,
    colSpan: "lg:col-span-4",
  },
];

export default function CreativeCapabilities() {
  return (
    <section id="capabilities" className="py-16 sm:py-28 lg:py-32 border-t border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* =========================================================================
            SECTION HEADER
        ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-16">
          <div className="max-w-3xl">
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 text-xs uppercase font-mono tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#F5D90A]" />
              <span>What We Do</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white leading-tight">
              Our <span className="text-[#F5D90A] font-normal italic font-serif">Services</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-zinc-400 font-light max-w-2xl mt-2.5 sm:mt-3 leading-relaxed">
              High-end video production powered by modern AI. Fast turnaround, fair pricing, and top-tier quality.
            </p>
          </div>

          <span className="text-xs font-mono text-zinc-400 hidden lg:inline">
            4K Video &bull; Fast Delivery
          </span>
        </div>

        {/* =========================================================================
            CARD GRID (2 Flagship + 3 Core)
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-7 items-stretch">
          {DISCIPLINES.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.number}
                className={`col-span-12 ${item.colSpan} flex flex-col`}
              >
                <div className="relative w-full h-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#131313]/90 via-[#0e0e0e]/90 to-[#070707]/90 backdrop-blur-xl border border-white/10 hover:border-[#F5D90A]/40 active:border-[#F5D90A]/50 transition-all duration-500 p-4 xs:p-5 sm:p-8 flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.85)] group overflow-hidden active:scale-[0.99]">
                  
                  {/* Subtle Corner Glow Aura */}
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-[radial-gradient(circle_at_center,_rgba(245,217,10,0.08)_0%,_transparent_70%)] blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

                  {/* Top Header Row */}
                  <div>
                    <div className="flex items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-white/[0.08]">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-mono font-medium tracking-widest text-[#F5D90A] bg-[#F5D90A]/10 border border-[#F5D90A]/20 px-2 py-0.5 rounded-md">
                          ({item.number})
                        </span>
                        <span className="text-[9px] xs:text-[10px] font-mono tracking-widest uppercase text-zinc-400">
                          {item.categoryTag}
                        </span>
                      </div>

                      <div className="w-9 h-9 xs:w-10 xs:h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#F5D90A] group-hover:border-[#F5D90A]/40 group-hover:bg-[#F5D90A]/10 transition-colors shrink-0 shadow-sm">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Discipline Title & Tagline */}
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-light text-white tracking-tight group-hover:text-[#F5D90A] transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-[11px] xs:text-xs font-mono text-[#F5D90A] mt-1 tracking-wide">
                      {item.tagline}
                    </p>

                    {/* Discipline Description */}
                    <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed mt-2.5 sm:mt-3.5">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Highlights Row */}
                  <div className="pt-3.5 sm:pt-6 mt-3.5 sm:mt-6 border-t border-white/[0.08] flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {item.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[9.5px] xs:text-[10px] sm:text-[11px] font-mono text-zinc-300 shadow-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F5D90A]" />
                        <span>{highlight}</span>
                      </span>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
