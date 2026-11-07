"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { IProject } from "@/types/project";
import { Film, Play, ArrowUpRight } from "lucide-react";
import { getOptimizedVideoUrl } from "@/lib/media";

interface SelectedWorkProps {
  projects: IProject[];
}

interface DisciplineConfig {
  id: string;
  category: string;
  number: string;
  title: string;
  tagline: string;
  fallbackSlug: string;
  fallbackPoster: string;
  fallbackVideo: string;
  colSpan: string;
}

const DISCIPLINE_CARDS: DisciplineConfig[] = [
  {
    id: "commercial",
    category: "Commercial",
    number: "01",
    title: "Commercial",
    tagline: "TV & Digital Ads",
    fallbackSlug: "chronos-fluid-precision",
    fallbackPoster: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop",
    fallbackVideo: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014426/samples/cld-sample-video.mp4",
    colSpan: "lg:col-span-7",
  },
  {
    id: "product-film",
    category: "Product Film",
    number: "02",
    title: "Product Film",
    tagline: "Product & Tech Films",
    fallbackSlug: "aether-one-genesis",
    fallbackPoster: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1600&auto=format&fit=crop",
    fallbackVideo: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794050877/samples/snow_deer.mp4",
    colSpan: "lg:col-span-5",
  },
  {
    id: "brand-campaign",
    category: "Brand Campaign",
    number: "03",
    title: "Brand Campaign",
    tagline: "Brand Visuals",
    fallbackSlug: "neura-synthesized-botanicals",
    fallbackPoster: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1600&auto=format&fit=crop",
    fallbackVideo: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014426/samples/sea-turtle.mp4",
    colSpan: "lg:col-span-4",
  },
  {
    id: "cinematic-visual",
    category: "Cinematic Visual",
    number: "04",
    title: "Cinematic Visual",
    tagline: "3D & Sci-Fi Visuals",
    fallbackSlug: "solaris-autonomous-orbit",
    fallbackPoster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop",
    fallbackVideo: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014426/samples/elephants.mp4",
    colSpan: "lg:col-span-4",
  },
  {
    id: "social-creative",
    category: "Social Creative",
    number: "05",
    title: "Social Creative",
    tagline: "Vertical Social Ads",
    fallbackSlug: "vortex-kinetic-performance",
    fallbackPoster: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1600&auto=format&fit=crop",
    fallbackVideo: "https://res.cloudinary.com/opkjlyme/video/upload/f_auto,q_auto,vc_auto,w_1920,c_limit/v1794014427/samples/dance-2.mp4",
    colSpan: "lg:col-span-4",
  },
];

function DisciplineCard({
  config,
  projects,
}: {
  config: DisciplineConfig;
  projects: IProject[];
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Match all projects in this category
  const sectionProjects = projects.filter(
    (p) => p.category.toLowerCase() === config.category.toLowerCase()
  );

  const primaryProject = sectionProjects[0];
  const rawVideoUrl = primaryProject?.videoUrl || config.fallbackVideo;
  const videoUrl = getOptimizedVideoUrl(rawVideoUrl, { width: 1280, quality: "eco" });
  const fullStreamUrl = getOptimizedVideoUrl(rawVideoUrl, { width: 1920, quality: "good" });
  const posterUrl = primaryProject?.thumbnailUrl || config.fallbackPoster;
  const projectSlug = primaryProject?.slug || config.fallbackSlug;
  const videoViewUrl = `/project/${projectSlug}?category=${encodeURIComponent(config.category)}`;

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Warm up the destination video cache on hover
    if (typeof window !== "undefined" && fullStreamUrl) {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "fetch";
      link.href = fullStreamUrl;
      document.head.appendChild(link);
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <div
      className={`col-span-12 ${config.colSpan} flex flex-col`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={videoViewUrl}
        prefetch={true}
        className="group relative block w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 hover:border-[#F5D90A]/60 active:border-[#F5D90A] transition-all duration-500 bg-[#0c0c0c] shadow-[0_15px_50px_rgba(0,0,0,0.85)] hover:shadow-[0_20px_70px_rgba(245,217,10,0.15)] flex flex-col justify-between min-h-[250px] xs:min-h-[275px] sm:min-h-[380px] p-4 xs:p-5 sm:p-7 active:scale-[0.99]"
      >
        {/* =========================================================================
            BACKGROUND MEDIA (POSTER & HOVER VIDEO)
        ========================================================================= */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* High-Res Poster Thumbnail */}
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 ${
              isHovered ? "opacity-30" : "opacity-80"
            }`}
            style={{ backgroundImage: `url(${posterUrl})` }}
          />

          {/* Smooth Video Loop on Hover */}
          <video
            ref={videoRef}
            src={videoUrl}
            muted
            loop
            playsInline
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-out ${
              isHovered ? "opacity-90 scale-105" : "opacity-0"
            }`}
          />

          {/* High-contrast scrim gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/30 pointer-events-none" />
        </div>

        {/* =========================================================================
            TOP ROW: NUMBER BADGE & VIDEO COUNT
        ========================================================================= */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-[10px] xs:text-xs font-mono tracking-widest text-[#F5D90A] uppercase px-2.5 xs:px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#F5D90A]/30 flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5D90A] animate-pulse" />
            <span>{config.number} // {config.category.toUpperCase()}</span>
          </span>

          <span className="text-[10px] xs:text-[11px] font-mono text-zinc-300 px-2.5 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-md">
            <Film className="w-3 h-3 text-[#F5D90A]" />
            <span>{sectionProjects.length || 1} {sectionProjects.length === 1 ? "Film" : "Films"} &bull; 4K</span>
          </span>
        </div>

        {/* =========================================================================
            CENTER PLAY ICON
        ========================================================================= */}
        <div className="relative z-10 my-auto flex items-center justify-center py-2.5 sm:py-4">
          <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-black/70 backdrop-blur-xl border border-white/20 group-hover:border-[#F5D90A] group-hover:bg-[#F5D90A] active:bg-[#F5D90A] active:text-black text-white group-hover:text-black flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-[0_0_25px_rgba(0,0,0,0.85)] group-hover:shadow-[0_0_35px_rgba(245,217,10,0.45)]">
            <Play className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 fill-current ml-0.5 transition-transform" />
          </div>
        </div>

        {/* =========================================================================
            BOTTOM INFO: SHORT & ON POINT
        ========================================================================= */}
        <div className="relative z-10 flex items-end justify-between pt-3 sm:pt-4 border-t border-white/[0.08]">
          <div>
            <h3 className="text-lg xs:text-xl sm:text-3xl font-light text-white tracking-tight group-hover:text-[#F5D90A] transition-colors leading-snug">
              {config.title}
            </h3>
            <p className="text-[10px] xs:text-xs font-mono text-zinc-400 mt-0.5 sm:mt-1">
              {config.tagline}
            </p>
          </div>

          <div className="inline-flex items-center gap-1 text-[10px] xs:text-xs font-mono text-white group-hover:text-[#F5D90A] transition-colors shrink-0 ml-3 px-2.5 xs:px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 group-hover:border-[#F5D90A]/40">
            <span>Watch</span>
            <ArrowUpRight className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-[#F5D90A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function SelectedWork({ projects }: SelectedWorkProps) {
  return (
    <section id="work" className="py-16 sm:py-24 lg:py-28 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* =========================================================================
            CLEAN SECTION HEADER
        ========================================================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 text-xs uppercase font-mono tracking-widest mb-3">
              <Film className="w-3.5 h-3.5 text-[#F5D90A]" />
              <span>Our Work</span>
            </div>

            <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-extralight tracking-tight text-white leading-tight">
              Selected <span className="text-[#F5D90A] font-medium">Reels</span> &amp; Commercials
            </h2>
          </div>

          <span className="text-xs font-mono text-zinc-400">
            5 Categories &bull; 4K Quality
          </span>
        </div>

        {/* =========================================================================
            DISCIPLINE CARDS GRID (2 + 3)
        ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {DISCIPLINE_CARDS.map((config) => (
            <DisciplineCard
              key={config.id}
              config={config}
              projects={projects}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
