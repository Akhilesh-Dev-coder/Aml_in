"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IProject } from "@/types/project";
import { Play, ArrowUpRight } from "lucide-react";

interface ProjectCardProps {
  project: IProject;
  index: number;
  onOpen?: () => void;
  variant?: "featured-wide" | "featured-tall" | "standard";
}

export default function ProjectCard({
  project,
  index,
  onOpen,
  variant = "standard",
}: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
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

  // Determine aspect ratio class based on variant
  const aspectClass =
    variant === "featured-wide"
      ? "aspect-[16/9] sm:aspect-[16/9] lg:aspect-[16/9]"
      : variant === "featured-tall"
      ? "aspect-[4/5] sm:aspect-[4/5]"
      : "aspect-[16/10] sm:aspect-[16/10]";

  const projectUrl = `/project/${project.slug || project.id}`;
  const posterSrc = project.thumbnailUrl && project.thumbnailUrl.trim() !== "" ? project.thumbnailUrl : "/images/aml_logo.svg";

  return (
    <Link
      href={projectUrl}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-3xl bg-[#171717] border border-white/10 hover:border-[#F5D90A]/40 overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,217,10,0.1)] flex flex-col justify-between block"
    >
      {/* Media Canvas */}
      <div className={`relative w-full ${aspectClass} overflow-hidden bg-zinc-950`}>
        {/* Poster Image */}
        {posterSrc.endsWith(".svg") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterSrc}
            alt={project.title}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              isHovered ? "opacity-20" : "opacity-90"
            }`}
          />
        ) : (
          <Image
            src={posterSrc}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              isHovered ? "opacity-20" : "opacity-90"
            }`}
          />
        )}

        {/* Hover Video Preview */}
        <video
          ref={videoRef}
          src={project.videoUrl}
          muted
          playsInline
          loop
          preload="none"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            isHovered ? "opacity-100 scale-105" : "opacity-0 scale-100"
          }`}
        />

        {/* Ambient Dark Scrims */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-black/20 to-black/50 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono tracking-wider">
            <span>{project.category}</span>
          </span>

          {project.year && (
            <span className="text-[11px] font-mono text-zinc-400 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full">
              {project.year}
            </span>
          )}
        </div>

        {/* Center Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-[#F5D90A] text-black flex items-center justify-center shadow-[0_0_25px_rgba(245,217,10,0.4)] opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Content Footer */}
      <div className="p-6 sm:p-7 flex flex-col justify-between bg-[#171717] border-t border-white/[0.06] relative z-10">
        <div>
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="text-xl sm:text-2xl font-light text-white tracking-tight group-hover:text-[#F5D90A] transition-colors">
              {project.title}
            </h3>
            <div className="w-8 h-8 rounded-full border border-white/10 group-hover:border-[#F5D90A]/40 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-[#F5D90A] transition-all">
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 font-light line-clamp-2 leading-relaxed">
            {project.caption}
          </p>
        </div>

        {project.clientName && (
          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span className="uppercase tracking-widest text-zinc-400">Client / Brand</span>
            <span className="text-zinc-200">{project.clientName}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
