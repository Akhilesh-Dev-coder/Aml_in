"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowUpRight, Lock } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? "py-2.5 sm:py-3 bg-[#050505]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
            : "py-3.5 sm:py-6 bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Creator Brand / Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3 text-white transition-all hover:opacity-95"
          >
            {/* Brand Logo Avatar Badge */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-[#F5D90A]/40 ring-1 ring-white/10 group-hover:border-[#F5D90A] group-hover:ring-[#F5D90A]/30 transition-all duration-300 shadow-[0_0_15px_rgba(245,217,10,0.25)] relative bg-[#0a0a0a]">
                <Image
                  src="/images/aml_logo.svg"
                  alt="AML - AI Commercial Director"
                  width={36}
                  height={36}
                  priority
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {/* Active Live Status Dot */}
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5D90A] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F5D90A] border-[1.5px] border-[#050505]"></span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-wider text-sm sm:text-base uppercase text-white group-hover:text-[#F5D90A] transition-colors leading-none">
                  AML.IN
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#F5D90A] bg-[#F5D90A]/10 border border-[#F5D90A]/20 px-1.5 py-0.5 rounded font-medium leading-none">
                  AI DIR
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-mono mt-1">
                AI Commercial Director
              </span>
            </div>
          </Link>

          {/* Center Navigation Links - Floating Glass Capsule */}
          <nav className="hidden md:flex items-center gap-1 bg-[#171717]/80 backdrop-blur-md border border-white/[0.08] rounded-full px-5 py-1.5 shadow-inner">
            <Link
              href="#work"
              className="px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
            >
              Work
            </Link>
            <Link
              href="#capabilities"
              className="px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
            >
              Services
            </Link>
            <Link
              href="#about"
              className="px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
            >
              About
            </Link>
            <Link
              href="#contact"
              className="px-4 py-1.5 text-xs uppercase tracking-wider text-zinc-300 hover:text-white transition-colors rounded-full hover:bg-white/[0.06]"
            >
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              title="Admin Portal"
              className="p-2 text-zinc-500 hover:text-[#F5D90A] transition-colors rounded-full border border-transparent hover:border-white/10 hover:bg-white/5"
            >
              <Lock className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="#contact"
              className="inline-flex items-center gap-2 bg-[#F5D90A] hover:bg-[#e5ca09] text-black font-semibold text-xs tracking-wider uppercase px-5 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.02] shadow-[0_0_20px_rgba(245,217,10,0.25)]"
            >
              <span>Start Project</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/admin"
              className="p-2 text-zinc-400 hover:text-[#F5D90A]"
              title="Admin"
            >
              <Lock className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-300 hover:text-white border border-white/10 rounded-full bg-white/5 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#050505]/95 backdrop-blur-2xl flex flex-col justify-between p-6 xs:p-8 pt-24 xs:pt-28 md:hidden animate-in fade-in duration-300">
          <div className="flex flex-col gap-6">
            {/* Mobile Header Brand Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#F5D90A]/50 shadow-[0_0_15px_rgba(245,217,10,0.3)] shrink-0 bg-black">
                <Image
                  src="/images/aml_logo.svg"
                  alt="AML Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base uppercase tracking-wider text-white">AML.IN</span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F5D90A]/10 text-[#F5D90A] border border-[#F5D90A]/30">
                    DIRECTOR
                  </span>
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  Commercials &bull; Cinema &bull; 4K
                </span>
              </div>
            </div>

            <span className="text-xs uppercase font-mono tracking-widest text-[#F5D90A]">
              Navigation
            </span>
            <Link
              href="#work"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-light text-white hover:text-[#F5D90A] transition-colors"
            >
              Work
            </Link>
            <Link
              href="#capabilities"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-light text-white hover:text-[#F5D90A] transition-colors"
            >
              Services
            </Link>
            <Link
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-light text-white hover:text-[#F5D90A] transition-colors"
            >
              About
            </Link>
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="text-2xl font-light text-white hover:text-[#F5D90A] transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
            <Link
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center bg-[#F5D90A] text-black font-semibold text-sm tracking-wider uppercase py-3.5 rounded-full"
            >
              Start Project
            </Link>
            <p className="text-xs text-zinc-500 text-center font-mono">
              Available for projects worldwide.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
