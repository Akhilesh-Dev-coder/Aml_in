"use client";

import React, { useEffect, useRef, useState } from "react";
import { IProject } from "@/types/project";
import { X, Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Maximize2, Tag, Calendar, Building2 } from "lucide-react";

interface ProjectViewerModalProps {
  project: IProject | null;
  projects: IProject[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (index: number) => void;
}

export default function ProjectViewerModal({
  project,
  projects,
  currentIndex,
  isOpen,
  onClose,
  onSelectProject,
}: ProjectViewerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, projects]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          // Fallback if browser blocks unmuted autoplay
          setIsMuted(true);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play().catch(() => {});
          }
        });
      }
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handlePrev = () => {
    if (projects.length === 0) return;
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    onSelectProject(prevIndex);
  };

  const handleNext = () => {
    if (projects.length === 0) return;
    const nextIndex = (currentIndex + 1) % projects.length;
    onSelectProject(nextIndex);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-6 lg:p-10 animate-in fade-in duration-300"
    >
      {/* Background click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl max-h-[92vh] flex flex-col bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)]">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#141414]/90">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5D90A]/10 border border-[#F5D90A]/30 text-[#F5D90A] text-xs font-mono tracking-wider">
              <span>{project.category}</span>
            </span>
            {project.clientName && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-400 font-mono">
                <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                {project.clientName}
              </span>
            )}
            {project.year && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-400 font-mono">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                {project.year}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 mr-2">
              {currentIndex + 1} / {projects.length}
            </span>

            <button
              onClick={handlePrev}
              title="Previous Project (Left Arrow)"
              className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              title="Next Project (Right Arrow)"
              className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-2 rounded-full bg-white/5 hover:bg-[#F5D90A] text-white hover:text-black transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Container */}
        <div className="relative bg-black flex-1 flex items-center justify-center overflow-hidden min-h-[320px] max-h-[62vh] group">
          <video
            ref={videoRef}
            src={project.videoUrl}
            poster={project.thumbnailUrl}
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            playsInline
            className="w-full h-full object-contain max-h-[62vh] cursor-pointer"
          />

          {/* Large Floating Center Play Pause Overlay */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-[#F5D90A] text-black flex items-center justify-center shadow-[0_0_40px_rgba(245,217,10,0.5)] transform scale-100 hover:scale-110 transition-transform">
                <Play className="w-8 h-8 fill-black ml-1" />
              </div>
            </div>
          )}

          {/* Sleek Minimal Custom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-95 transition-opacity">
            {/* Progress Bar */}
            <div
              onClick={handleSeek}
              className="w-full h-1.5 bg-white/20 hover:h-2.5 rounded-full cursor-pointer mb-3 transition-all relative overflow-hidden group/bar"
            >
              <div
                className="h-full bg-[#F5D90A] rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover/bar:opacity-100" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white font-mono">
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  className="hover:text-[#F5D90A] transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-white" />
                  )}
                </button>

                <button
                  onClick={toggleMute}
                  className="hover:text-[#F5D90A] transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#F5D90A]" />
                  )}
                </button>

                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-zinc-400">
                <span>CINEMA MASTER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Details Footer */}
        <div className="p-6 sm:p-8 bg-[#111111] border-t border-white/[0.08] overflow-y-auto max-h-[25vh]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h2 className="text-xl sm:text-2xl font-light text-white tracking-tight mb-2">
                {project.title}
              </h2>
              <p className="text-sm text-[#F5D90A] font-mono mb-3">
                {project.caption}
              </p>
              {project.description && (
                <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:max-w-xs shrink-0">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-400"
                  >
                    <Tag className="w-2.5 h-2.5 text-[#F5D90A]" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
