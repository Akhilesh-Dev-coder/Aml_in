"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IProject } from "@/types/project";
import { getOptimizedVideoUrl, getOptimizedThumbnailUrl } from "@/lib/media";
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Maximize2,
  Calendar,
  Building2,
  Tag,
  ArrowLeft,
  Info,
  Film,
  Sparkles,
  Layers,
} from "lucide-react";

interface ProjectShowcaseViewProps {
  currentProject: IProject;
  allProjects: IProject[];
  initialCategory?: string;
}

export default function ProjectShowcaseView({
  currentProject,
  allProjects,
  initialCategory,
}: ProjectShowcaseViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryCat = searchParams.get("category");

  // Category Filtering
  const [activeCategory, setActiveCategory] = useState<string>(
    initialCategory || queryCat || "All"
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    allProjects.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [allProjects]);

  const displayProjects = useMemo(() => {
    if (!activeCategory || activeCategory === "All") return allProjects;
    return allProjects.filter(
      (p) => p.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [allProjects, activeCategory]);

  // Active Index within displayProjects
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = displayProjects.findIndex(
      (p) => p.slug === currentProject.slug || p.id === currentProject.id
    );
    return idx !== -1 ? idx : 0;
  });

  const activeProject = displayProjects[activeIndex] || currentProject;
  const activeOptimizedVideoUrl = useMemo(
    () => getOptimizedVideoUrl(activeProject.videoUrl),
    [activeProject.videoUrl]
  );
  const activePoster = useMemo(
    () => activeProject.thumbnailUrl || getOptimizedThumbnailUrl(activeProject.videoUrl),
    [activeProject.thumbnailUrl, activeProject.videoUrl]
  );

  // Instant player ready & buffering indicators
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Viewport detection to isolate desktop cinema and mobile reels playback
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Duration parser helper
  const parseDuration = useCallback((dur?: string): number => {
    if (!dur) return 0;
    const parts = dur.split(":").map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parts[0] * 60 + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    const num = parseFloat(dur);
    return isNaN(num) ? 0 : num;
  }, []);

  // Unmuted by default: videos play with sound
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  // Desktop specific player state & smooth 60fps timeline scrubber
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const [desktopProgress, setDesktopProgress] = useState(0);
  const [desktopCurrentTime, setDesktopCurrentTime] = useState(0);
  const [desktopDuration, setDesktopDuration] = useState(() =>
    parseDuration(activeProject.duration)
  );

  // Mobile Reels specific refs
  const mobileFeedRef = useRef<HTMLDivElement>(null);
  const mobileVideoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const [mobileInfoOpen, setMobileInfoOpen] = useState(false);
  const [mobileActiveTimes, setMobileActiveTimes] = useState<{ [key: number]: number }>({});
  const [mobileDurations, setMobileDurations] = useState<{ [key: number]: number }>({});

  // ---------------------------------------------------------------------------
  // Close handler
  // ---------------------------------------------------------------------------
  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/#work");
    }
  };

  // Keyboard navigation on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === "ArrowLeft") {
        selectProjectByIndex((activeIndex - 1 + displayProjects.length) % displayProjects.length);
      } else if (e.key === "ArrowRight") {
        selectProjectByIndex((activeIndex + 1) % displayProjects.length);
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, displayProjects.length]);

  // ---------------------------------------------------------------------------
  // Silent unmuting on first gesture (strictly for active viewport player)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const handleGesture = () => {
      setIsMuted(false);
      if (isDesktop) {
        if (desktopVideoRef.current) {
          desktopVideoRef.current.muted = false;
          desktopVideoRef.current.volume = 1;
        }
      } else {
        const activeMobile = mobileVideoRefs.current.get(activeIndex);
        if (activeMobile) {
          activeMobile.muted = false;
          activeMobile.volume = 1;
        }
      }
    };

    window.addEventListener("click", handleGesture, { once: true });
    window.addEventListener("touchstart", handleGesture, { once: true });
    window.addEventListener("pointerdown", handleGesture, { once: true });
    window.addEventListener("keydown", handleGesture, { once: true });

    return () => {
      window.removeEventListener("click", handleGesture);
      window.removeEventListener("touchstart", handleGesture);
      window.removeEventListener("pointerdown", handleGesture);
      window.removeEventListener("keydown", handleGesture);
    };
  }, [isDesktop, activeIndex]);

  // ---------------------------------------------------------------------------
  // DESKTOP: Video Playback & Autoplay Unmuted on Project Change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Immediate state reset for fluid transition
    const initialDur = parseDuration(activeProject.duration);
    setDesktopDuration(initialDur > 0 ? initialDur : 0);
    setDesktopCurrentTime(0);
    setDesktopProgress(0);
    setIsVideoReady(false);
    setIsBuffering(false);

    // If on mobile screen, ensure desktop player is strictly stopped and muted
    if (!isMounted || !isDesktop) {
      if (desktopVideoRef.current) {
        try {
          desktopVideoRef.current.pause();
          desktopVideoRef.current.muted = true;
          desktopVideoRef.current.currentTime = 0;
        } catch {}
      }
      return;
    }

    const vid = desktopVideoRef.current;
    if (!vid) return;

    vid.currentTime = 0;
    vid.muted = isMuted;
    vid.volume = 1;

    const playPromise = vid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // If browser policy restricted unmuted playback on direct cold visit,
          // play quietly until gesture without ever showing an unmute button/popup
          vid.muted = true;
          vid.play().catch(() => {});
        });
    }
  }, [activeProject.slug, isDesktop, isMounted, parseDuration]);

  // Synchronize mute state without restarting video playback
  useEffect(() => {
    if (isDesktop && desktopVideoRef.current) {
      desktopVideoRef.current.muted = isMuted;
    } else if (!isDesktop) {
      const currentMobile = mobileVideoRefs.current.get(activeIndex);
      if (currentMobile) {
        currentMobile.muted = isMuted;
      }
    }
  }, [isMuted, isDesktop, activeIndex]);

  // ---------------------------------------------------------------------------
  // DESKTOP: 60FPS Fluid Timeline Scrubber Animation Loop
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isPlaying || !isDesktop) return;
    let animId: number;

    const tick = () => {
      const vid = desktopVideoRef.current;
      if (vid && !isDraggingRef.current) {
        const cur = vid.currentTime;
        const dur =
          isFinite(vid.duration) && vid.duration > 0
            ? vid.duration
            : desktopDuration;
        setDesktopCurrentTime(cur);
        if (dur > 0) {
          setDesktopProgress(Math.min(100, Math.max(0, (cur / dur) * 100)));
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, isDesktop, desktopDuration]);

  // ---------------------------------------------------------------------------
  // MOBILE: Vertical Scroll Intersection Observer (Feed snapping)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isMounted || isDesktop) return;
    const feed = mobileFeedRef.current;
    if (!feed) return;

    // Scroll to initial active project on mobile mount
    const initialItem = feed.querySelector(`[data-reel-index="${activeIndex}"]`);
    if (initialItem) {
      initialItem.scrollIntoView({ behavior: "instant" });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexStr = entry.target.getAttribute("data-reel-index");
            if (indexStr !== null) {
              const newIdx = parseInt(indexStr, 10);
              if (!isNaN(newIdx) && newIdx !== activeIndex) {
                setActiveIndex(newIdx);

                // Update URL quietly without page reload
                const project = displayProjects[newIdx];
                if (project && typeof window !== "undefined") {
                  window.history.replaceState(
                    null,
                    "",
                    `/project/${project.slug}${
                      activeCategory && activeCategory !== "All"
                        ? `?category=${encodeURIComponent(activeCategory)}`
                        : ""
                    }`
                  );
                }
              }
            }
          }
        });
      },
      {
        root: feed,
        threshold: 0.65, // Must be >65% in view to become active
      }
    );

    const items = feed.querySelectorAll("[data-reel-index]");
    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [displayProjects, activeCategory, isMounted, isDesktop, activeIndex]);

  // ---------------------------------------------------------------------------
  // MOBILE: Video Play/Pause Management across Reels (Disabled on Desktop)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // If on desktop screen, ensure ALL mobile videos are strictly paused, muted, and reset
    if (!isMounted || isDesktop) {
      mobileVideoRefs.current.forEach((videoEl) => {
        try {
          videoEl.pause();
          videoEl.muted = true;
          videoEl.currentTime = 0;
        } catch {}
      });
      return;
    }

    // Only play the active mobile video, pause all others
    mobileVideoRefs.current.forEach((videoEl, idx) => {
      if (idx === activeIndex) {
        videoEl.muted = isMuted;
        videoEl.volume = 1;
        videoEl.currentTime = 0;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(() => {
              videoEl.muted = true;
              videoEl.play().catch(() => {});
            });
        }
      } else {
        try {
          videoEl.pause();
          videoEl.currentTime = 0;
        } catch {}
      }
    });
  }, [activeIndex, displayProjects, isDesktop, isMounted, isMuted]);

  // ---------------------------------------------------------------------------
  // Project selection from Laptop Gallery or Filter
  // ---------------------------------------------------------------------------
  const selectProjectByIndex = (idx: number) => {
    if (idx < 0 || idx >= displayProjects.length) return;
    setActiveIndex(idx);
    const targetProject = displayProjects[idx];
    if (targetProject && typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `/project/${targetProject.slug}${
          activeCategory && activeCategory !== "All"
            ? `?category=${encodeURIComponent(activeCategory)}`
            : ""
        }`
      );
    }
  };

  // Toggle Mute (Strictly for active screen)
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    if (isDesktop && desktopVideoRef.current) {
      desktopVideoRef.current.muted = nextMuted;
    } else if (!isDesktop) {
      const currentMobile = mobileVideoRefs.current.get(activeIndex);
      if (currentMobile) {
        currentMobile.muted = nextMuted;
      }
    }
  };

  // Toggle Play / Pause (Strictly for active screen)
  const togglePlay = () => {
    if (isDesktop && desktopVideoRef.current) {
      if (desktopVideoRef.current.paused) {
        desktopVideoRef.current.play();
        setIsPlaying(true);
      } else {
        desktopVideoRef.current.pause();
        setIsPlaying(false);
      }
    } else if (!isDesktop) {
      const currentMobile = mobileVideoRefs.current.get(activeIndex);
      if (currentMobile) {
        if (currentMobile.paused) {
          currentMobile.play();
          setIsPlaying(true);
        } else {
          currentMobile.pause();
          setIsPlaying(false);
        }
      }
    }
  };

  // Share handler
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------------------------------------------------------------------------
  // DESKTOP: Timeline Scrubbing & Drag Seeking
  // ---------------------------------------------------------------------------
  const seekToPosition = useCallback(
    (clientX: number) => {
      const bar = timelineRef.current;
      const vid = desktopVideoRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      if (rect.width <= 0) return;
      const clampedX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (clampedX / rect.width) * 100;
      setDesktopProgress(percentage);

      const dur =
        vid && isFinite(vid.duration) && vid.duration > 0
          ? vid.duration
          : desktopDuration;
      if (dur > 0) {
        const targetTime = (percentage / 100) * dur;
        setDesktopCurrentTime(targetTime);
        if (vid) {
          vid.currentTime = targetTime;
        }
      }
    },
    [desktopDuration]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    setIsScrubbing(true);
    seekToPosition(e.clientX);

    const onPointerMove = (moveEvent: PointerEvent) => {
      seekToPosition(moveEvent.clientX);
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      isDraggingRef.current = false;
      setIsScrubbing(false);
      seekToPosition(upEvent.clientX);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return "00:00";
    const totalSeconds = Math.floor(secs);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-hidden select-none">

      {/* =======================================================================
          1. MOBILE VIEW: FULLSCREEN NATIVE VERTICAL REELS FEED (< md)
          - No buttons to change videos: swipe/scroll up and down like Instagram Reels & TikTok!
          - Plays videos unmuted!
      ======================================================================= */}
      <div className="md:hidden h-[100dvh] w-full relative bg-black overflow-hidden">
        
        {/* Top Fixed Floating Navigation Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between z-40 pointer-events-auto">
          {/* Back button */}
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-mono uppercase text-white hover:text-[#F5D90A] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F5D90A]" />
            <span>Back</span>
          </button>

          {/* Reel Counter & Category */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5D90A] animate-pulse" />
            <span className="text-[#F5D90A]">{activeIndex + 1}</span>
            <span className="text-zinc-500">/</span>
            <span>{displayProjects.length}</span>
            <span className="text-[10px] text-zinc-400 ml-1 uppercase truncate max-w-[100px]">
              {activeProject.category}
            </span>
          </div>

          {/* Sound Mute Toggle & Close */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:text-[#F5D90A]"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-zinc-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#F5D90A]" />
              )}
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white hover:text-[#F5D90A]"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Native Vertical Snap Feed (Swipe up/down like Instagram Reels) */}
        <div
          ref={mobileFeedRef}
          className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth touch-pan-y relative bg-black no-scrollbar"
        >
          {displayProjects.map((proj, idx) => {
            const isThisActive = idx === activeIndex;
            const curTime = mobileActiveTimes[idx] || 0;
            const parsedDur = parseDuration(proj.duration);
            const dur =
              mobileDurations[idx] && mobileDurations[idx] > 0
                ? mobileDurations[idx]
                : parsedDur > 0
                ? parsedDur
                : 0;
            const prog = dur > 0 ? Math.min(100, (curTime / dur) * 100) : 0;

            return (
              <div
                key={proj.slug || proj.id || idx}
                data-reel-index={idx}
                className="h-[100dvh] w-full snap-start snap-always relative shrink-0 overflow-hidden flex items-center justify-center bg-black"
              >
                {/* Video Element (Muted and dormant when on desktop screen) */}
                <video
                  ref={(el) => {
                    if (el) mobileVideoRefs.current.set(idx, el);
                    else mobileVideoRefs.current.delete(idx);
                  }}
                  src={getOptimizedVideoUrl(proj.videoUrl)}
                  poster={proj.thumbnailUrl || getOptimizedThumbnailUrl(proj.videoUrl)}
                  loop
                  playsInline
                  preload={
                    isDesktop
                      ? "none"
                      : Math.abs(idx - activeIndex) <= 1
                      ? "auto"
                      : "none"
                  }
                  muted={isDesktop ? true : isMuted}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  onTimeUpdate={(e) => {
                    if (isThisActive && !isDesktop) {
                      const cur = e.currentTarget.currentTime;
                      setMobileActiveTimes((prev) => ({
                        ...prev,
                        [idx]: cur,
                      }));
                    }
                  }}
                  onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration;
                    if (isFinite(d) && d > 0) {
                      setMobileDurations((prev) => ({
                        ...prev,
                        [idx]: d,
                      }));
                    }
                  }}
                  onDurationChange={(e) => {
                    const d = e.currentTarget.duration;
                    if (isFinite(d) && d > 0) {
                      setMobileDurations((prev) => ({
                        ...prev,
                        [idx]: d,
                      }));
                    }
                  }}
                  className="w-full h-full object-cover"
                />

                {/* Central Play/Pause Watermark */}
                {isThisActive && !isPlaying && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 z-20"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#F5D90A] text-black flex items-center justify-center shadow-[0_0_30px_rgba(245,217,10,0.5)]">
                      <Play className="w-7 h-7 fill-black ml-1" />
                    </div>
                  </div>
                )}

                {/* Right Floating Reels Action Rail (Clean, NO next/prev buttons!) */}
                <div className="absolute right-3 xs:right-4 bottom-24 flex flex-col items-center gap-3.5 z-30 pointer-events-auto">
                  {/* Share button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare();
                    }}
                    className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-[#F5D90A] transition-colors"
                    title="Share Project"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#F5D90A]" />
                    ) : (
                      <Share2 className="w-4 h-4 text-zinc-300" />
                    )}
                  </button>

                  {/* Director Info button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMobileInfoOpen(true);
                    }}
                    className="w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:text-[#F5D90A] transition-colors"
                    title="Director Info"
                  >
                    <Info className="w-4 h-4 text-zinc-300" />
                  </button>
                </div>

                {/* Bottom Scrim & Reel Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pb-6 pt-16 bg-gradient-to-t from-black via-black/70 to-transparent z-30 pointer-events-auto">
                  <div className="max-w-[78%]">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-medium text-[#F5D90A]">
                        @AML.IN
                      </span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                        {proj.category}
                      </span>
                    </div>

                    <h2 className="text-base font-medium text-white tracking-tight mb-1">
                      {proj.title}
                    </h2>

                    <p className="text-xs text-zinc-300 font-light line-clamp-2">
                      {proj.caption}
                    </p>
                  </div>

                  {/* Bottom Timeline Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-[#F5D90A] transition-all duration-100"
                      style={{ width: `${isThisActive ? prog : 0}%` }}
                    />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Mobile Info Bottom Sheet Modal */}
        {mobileInfoOpen && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setMobileInfoOpen(false);
            }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121212] border-t border-white/15 rounded-t-3xl p-6 max-h-[75vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#F5D90A]" />
                  <h3 className="text-base font-medium text-white tracking-tight">
                    Director Film Breakdown
                  </h3>
                </div>
                <button
                  onClick={() => setMobileInfoOpen(false)}
                  className="p-1.5 rounded-full bg-white/5 text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h4 className="text-lg text-[#F5D90A] font-medium mb-1">
                {activeProject.title}
              </h4>
              <p className="text-xs font-mono text-zinc-400 mb-4">
                {activeProject.caption}
              </p>

              <p className="text-xs text-zinc-300 font-light leading-relaxed mb-6">
                {activeProject.description}
              </p>

              {activeProject.clientName && (
                <div className="flex items-center justify-between text-xs font-mono py-2.5 border-b border-white/[0.06]">
                  <span className="text-zinc-500 uppercase">Brand / Client</span>
                  <span className="text-zinc-200 font-medium">{activeProject.clientName}</span>
                </div>
              )}

              {activeProject.year && (
                <div className="flex items-center justify-between text-xs font-mono py-2.5 border-b border-white/[0.06]">
                  <span className="text-zinc-500 uppercase">Release Year</span>
                  <span className="text-zinc-200">{activeProject.year}</span>
                </div>
              )}

              {activeProject.tags && activeProject.tags.length > 0 && (
                <div className="pt-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2">
                    Aesthetic &amp; Pipeline Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProject.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* =======================================================================
          2. LAPTOP / DESKTOP VIEW: CINEMATIC THEATER + INTERACTIVE REEL GALLERY (>= md)
          - Video starts playing UNMUTED!
          - Users can see all available videos in the portfolio and click to change instantly!
      ======================================================================= */}
      <div className="hidden md:flex flex-col min-h-screen p-6 lg:p-10 relative max-w-[1600px] mx-auto">
        
        {/* Ambient Backlight Aura */}
        <div className="absolute top-1/3 left-1/3 w-[800px] h-[550px] ambient-yellow-aura rounded-full blur-3xl opacity-25 pointer-events-none" />

        {/* Top Header Bar */}
        <header className="flex items-center justify-between relative z-20 pb-5 mb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#151515] hover:bg-[#202020] border border-white/10 text-xs font-mono uppercase tracking-wider text-zinc-300 hover:text-white transition-all group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#F5D90A] group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Work</span>
              <span className="text-[10px] font-mono text-zinc-500 ml-1">[ESC]</span>
            </button>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#121212] border border-white/10">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setActiveIndex(0);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                      isSelected
                        ? "bg-[#F5D90A] text-black font-medium shadow-sm"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Audio Toggle Pill */}
            <button
              onClick={toggleMute}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151515] hover:bg-[#202020] border border-white/10 text-xs font-mono text-zinc-300 transition-colors"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#F5D90A]" />
                  <span className="text-white">Unmuted</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151515] hover:bg-[#202020] border border-white/10 text-xs font-mono text-zinc-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#F5D90A]" />
                  <span className="text-[#F5D90A]">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              title="Close (ESC)"
              className="p-2 rounded-full bg-[#F5D90A] text-black hover:bg-[#ffe32a] transition-all ml-1 shadow-md hover:scale-105"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Grid: Main Theater (Left) + Interactive Video Gallery (Right) */}
        <div className="grid grid-cols-12 gap-8 items-start relative z-20 flex-1">
          
          {/* =================================================================
              LEFT: MAIN 16:9 CINEMA VIEWER (Col 8)
          ================================================================= */}
          <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
            
            {/* 16:9 Video Player Card */}
            <div className="relative rounded-3xl bg-[#0c0c0c] border border-white/15 overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.95)] group">
              <div className="relative aspect-[16/9] w-full bg-black flex items-center justify-center overflow-hidden">
                {/* Instant High-Res Poster Frame Preview to eliminate pitch-black pause */}
                {activePoster && (
                  <div
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-300 pointer-events-none z-10 ${
                      isVideoReady ? "opacity-0" : "opacity-100"
                    }`}
                    style={{ backgroundImage: `url(${activePoster})` }}
                  >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
                      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 border border-white/10 text-[11px] font-mono text-zinc-300 shadow-xl">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F5D90A] animate-ping" />
                        <span>Streaming 4K Reel...</span>
                      </div>
                    </div>
                  </div>
                )}

                <video
                  ref={desktopVideoRef}
                  src={activeOptimizedVideoUrl}
                  poster={activePoster}
                  loop
                  muted={!isDesktop || isMuted}
                  playsInline
                  preload="auto"
                  onClick={togglePlay}
                  onCanPlay={(e) => {
                    setIsVideoReady(true);
                    const d = e.currentTarget.duration;
                    if (isFinite(d) && d > 0) {
                      setDesktopDuration(d);
                    }
                  }}
                  onDurationChange={(e) => {
                    const d = e.currentTarget.duration;
                    if (isFinite(d) && d > 0) {
                      setDesktopDuration(d);
                    }
                  }}
                  onLoadedMetadata={(e) => {
                    const d = e.currentTarget.duration;
                    if (isFinite(d) && d > 0) {
                      setDesktopDuration(d);
                    }
                    setIsVideoReady(true);
                  }}
                  onPlaying={() => {
                    setIsVideoReady(true);
                    setIsBuffering(false);
                    setIsPlaying(true);
                  }}
                  onWaiting={() => setIsBuffering(true)}
                  onEnded={() => {
                    setDesktopCurrentTime(0);
                    setDesktopProgress(0);
                  }}
                  onTimeUpdate={(e) => {
                    if (!isDraggingRef.current) {
                      const cur = e.currentTarget.currentTime;
                      const d =
                        isFinite(e.currentTarget.duration) &&
                        e.currentTarget.duration > 0
                          ? e.currentTarget.duration
                          : desktopDuration;
                      setDesktopCurrentTime(cur);
                      if (d > 0) {
                        setDesktopProgress(
                          Math.min(100, Math.max(0, (cur / d) * 100))
                        );
                      }
                    }
                  }}
                  className={`w-full h-full object-contain cursor-pointer transition-opacity duration-300 z-0 ${
                    isVideoReady ? "opacity-100" : "opacity-90"
                  }`}
                />

                {/* Big Watermark Play Button when paused */}
                {!isPlaying && isVideoReady && (
                  <div
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-20"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#F5D90A] text-black flex items-center justify-center shadow-[0_0_40px_rgba(245,217,10,0.5)] transform scale-100 hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 fill-black ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Custom Cinema Controls Scrim */}
              <div className="p-4 sm:p-5 bg-gradient-to-t from-black via-[#121212] to-[#121212]/95 border-t border-white/[0.08]">
                {/* Scrub Timeline with Drag & 60FPS Smooth Seeking */}
                <div
                  ref={timelineRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={(e) => {
                    const bar = timelineRef.current;
                    if (!bar) return;
                    const rect = bar.getBoundingClientRect();
                    if (rect.width <= 0) return;
                    const clampedX = Math.max(
                      0,
                      Math.min(e.clientX - rect.left, rect.width)
                    );
                    setHoverProgress((clampedX / rect.width) * 100);
                  }}
                  onPointerLeave={() => setHoverProgress(null)}
                  className="w-full py-2.5 cursor-pointer relative group/scrub mb-2 select-none"
                  title="Click or drag to seek"
                >
                  {/* Track Bar */}
                  <div className="w-full h-1.5 group-hover/scrub:h-2 bg-white/20 rounded-full transition-all duration-150 relative">
                    {/* Hover Preview Bar */}
                    {hoverProgress !== null && (
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-white/20 rounded-full pointer-events-none"
                        style={{ width: `${hoverProgress}%` }}
                      />
                    )}

                    {/* Progress Bar Fill */}
                    <div
                      className="h-full bg-[#F5D90A] rounded-full relative pointer-events-none transition-[width] duration-75 ease-linear"
                      style={{ width: `${desktopProgress}%` }}
                    >
                      {/* Scrubber Thumb Knob */}
                      <div
                        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_12px_rgba(245,217,10,0.9)] border border-black/30 transition-transform ${
                          isScrubbing
                            ? "scale-125 opacity-100"
                            : "scale-100 opacity-0 group-hover/scrub:opacity-100"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Controls Bar */}
                <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      className="hover:text-[#F5D90A] transition-colors p-1"
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-white" />
                      )}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="hover:text-[#F5D90A] transition-colors p-1"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-[#F5D90A]" />
                      )}
                    </button>

                    <span className="text-zinc-400 tabular-nums">
                      {formatTime(desktopCurrentTime)} / {formatTime(desktopDuration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
                      4K PRORES MASTER
                    </span>

                    <button
                      onClick={() => {
                        if (desktopVideoRef.current) {
                          if (document.fullscreenElement) {
                            document.exitFullscreen().catch(() => {});
                          } else {
                            desktopVideoRef.current.requestFullscreen().catch(() => {});
                          }
                        }
                      }}
                      className="hover:text-[#F5D90A] transition-colors p-1"
                      title="Fullscreen"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Editorial Metadata Card */}
            <div className="bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
                      {activeProject.title}
                    </h1>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#F5D90A]/10 text-[#F5D90A] border border-[#F5D90A]/30">
                      {activeProject.category}
                    </span>
                  </div>

                  <p className="text-sm font-mono text-[#F5D90A] mb-3">
                    {activeProject.caption}
                  </p>

                  <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                    {activeProject.description}
                  </p>
                </div>

                {/* Right Meta Column */}
                <div className="flex flex-col gap-3 lg:max-w-xs shrink-0 lg:border-l lg:border-white/10 lg:pl-6">
                  {activeProject.clientName && (
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Client: {activeProject.clientName}</span>
                    </div>
                  )}

                  {activeProject.year && (
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Release: {activeProject.year}</span>
                    </div>
                  )}

                  {activeProject.tags && activeProject.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {activeProject.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* =================================================================
              RIGHT: INTERACTIVE VIDEO GALLERY QUEUE (Col 4)
              - Users see all available videos at a glance and click to change!
          ================================================================= */}
          <div className="col-span-12 xl:col-span-4 flex flex-col gap-3 sticky top-6">
            
            {/* Gallery Header */}
            <div className="flex items-center justify-between px-1 mb-1">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-[#F5D90A]" />
                <span className="text-xs font-mono uppercase tracking-widest text-white font-medium">
                  Studio Reel Queue
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                {displayProjects.length} {displayProjects.length === 1 ? "Video" : "Videos"}
              </span>
            </div>

            {/* Scrollable Project Cards List */}
            <div className="max-h-[calc(100vh-140px)] overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
              {displayProjects.map((p, idx) => {
                const isSelected = idx === activeIndex;

                return (
                  <div
                    key={p.slug || p.id || idx}
                    onClick={() => selectProjectByIndex(idx)}
                    onMouseEnter={() => {
                      const targetUrl = getOptimizedVideoUrl(p.videoUrl);
                      if (targetUrl && typeof window !== "undefined") {
                        const link = document.createElement("link");
                        link.rel = "prefetch";
                        link.as = "fetch";
                        link.href = targetUrl;
                        document.head.appendChild(link);
                      }
                    }}
                    className={`group cursor-pointer rounded-2xl p-3.5 border transition-all duration-300 flex items-center gap-3.5 relative overflow-hidden ${
                      isSelected
                        ? "bg-[#181818] border-[#F5D90A] shadow-[0_0_25px_rgba(245,217,10,0.2)] ring-1 ring-[#F5D90A]/40"
                        : "bg-[#111111]/80 hover:bg-[#161616] border-white/10 hover:border-white/25"
                    }`}
                  >
                    {/* Active Golden Glow Accent Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F5D90A]" />
                    )}

                    {/* Thumbnail with duration badge */}
                    <div className="relative w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 flex items-center justify-center">
                      {p.thumbnailUrl && !p.thumbnailUrl.endsWith(".svg") ? (
                        <Image
                          src={p.thumbnailUrl}
                          alt={p.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="120px"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnailUrl || "/images/aml_logo.svg"}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      )}

                      {/* Playing overlay icon or duration badge */}
                      {isSelected ? (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="flex items-end gap-1 h-3.5">
                            <span className="w-1 bg-[#F5D90A] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-full" />
                            <span className="w-1 bg-[#F5D90A] rounded-full animate-[pulse_0.6s_ease-in-out_infinite_0.2s] h-2/3" />
                            <span className="w-1 bg-[#F5D90A] rounded-full animate-[pulse_0.9s_ease-in-out_infinite_0.4s] h-4/5" />
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-black/60 border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-3 h-3 fill-white ml-0.5" />
                          </div>
                        </div>
                      )}

                      <span className="absolute bottom-1 right-1 text-[9px] font-mono px-1 rounded bg-black/80 text-zinc-300">
                        {p.duration || "4K"}
                      </span>
                    </div>

                    {/* Project Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase text-[#F5D90A] tracking-wider truncate">
                          {p.category}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#F5D90A]/20 text-[#F5D90A] font-semibold border border-[#F5D90A]/40 shrink-0">
                            PLAYING
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-medium tracking-tight truncate transition-colors ${
                          isSelected
                            ? "text-white font-semibold"
                            : "text-zinc-300 group-hover:text-white"
                        }`}
                      >
                        {p.title}
                      </h4>

                      <p className="text-[11px] text-zinc-400 font-light truncate mt-0.5">
                        {p.clientName ? `Client: ${p.clientName}` : p.caption}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
