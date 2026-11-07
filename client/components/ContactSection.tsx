"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, MessageSquare, Copy, Check, ArrowUpRight, ArrowUp, Lock } from "lucide-react";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function ContactSection() {
  const [copied, setCopied] = useState(false);
  const email = "contact@aml.in";
  const whatsappUrl = "https://wa.me/15551234567";
  const instagramUrl = "https://instagram.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer id="contact" className="pt-20 sm:pt-28 pb-10 sm:pb-12 border-t border-white/[0.08] relative bg-[#050505]/40 backdrop-blur-[2px]">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ambient-yellow-aura rounded-full blur-3xl pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Bold Closing Heading */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          {/* Brand Director Insignia Pill */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-zinc-300 text-xs font-mono tracking-widest mb-6 shadow-[0_0_20px_rgba(245,217,10,0.12)] group hover:border-[#F5D90A]/40 transition-colors">
            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#F5D90A]/60 ring-1 ring-black shrink-0 relative bg-black">
              <Image
                src="/images/aml_logo.svg"
                alt="AML Emblem"
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="uppercase text-white font-medium tracking-wider">AML STUDIO</span>
            <span className="w-1 h-1 rounded-full bg-[#F5D90A]" />
            <span className="text-[#F5D90A] uppercase tracking-wider text-[11px]">Direct Bookings</span>
          </div>

          <h2 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extralight tracking-tight text-white leading-[1.08] mb-6 sm:mb-8">
            Ready to make your brand <br className="hidden sm:block" />
            <span className="text-[#F5D90A] font-normal italic font-serif">stand out?</span>
          </h2>

          <p className="text-sm sm:text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-12">
            Let&apos;s make a video commercial that people remember. Send us a quick message to get started.
          </p>

          {/* Primary Action Button Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-xl mx-auto">
            <a
              href={`mailto:${email}?subject=Commercial%20Inquiry%20via%20Portfolio`}
              className="group inline-flex items-center justify-center gap-2.5 bg-[#F5D90A] hover:bg-[#ffe32a] text-black font-semibold text-xs sm:text-sm tracking-wider uppercase px-7 py-3 sm:py-3.5 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-[0_0_25px_rgba(245,217,10,0.35)] hover:shadow-[0_0_35px_rgba(245,217,10,0.5)] whitespace-nowrap w-full sm:w-auto"
            >
              <Mail className="w-4 h-4 stroke-[2.2]" />
              <span>Send an Email</span>
              <ArrowUpRight className="w-4 h-4 stroke-[2.2] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>

            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/15 hover:border-[#F5D90A]/40 active:border-[#F5D90A]/60 active:scale-95 font-mono text-xs sm:text-sm tracking-wider px-6 py-3 sm:py-3.5 rounded-full transition-all whitespace-nowrap w-full sm:w-auto shadow-sm"
              title="Copy Email Address"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#F5D90A]" />
                  <span className="text-[#F5D90A]">Email Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-400" />
                  <span>{email}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Channels & Social Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 max-w-xl mx-auto gap-3 sm:gap-4 mb-16 sm:mb-24">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#131313] to-[#0c0c0c] hover:bg-[#1a1a1a] border border-white/10 hover:border-[#F5D90A]/40 active:border-[#F5D90A]/60 flex items-center justify-between transition-all group active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F5D90A] group-hover:bg-[#F5D90A] group-hover:text-black transition-colors shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 block">
                  Quick Chat
                </span>
                <span className="text-sm font-medium text-white">
                  WhatsApp
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-[#F5D90A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#131313] to-[#0c0c0c] hover:bg-[#1a1a1a] border border-white/10 hover:border-[#F5D90A]/40 active:border-[#F5D90A]/60 flex items-center justify-between transition-all group active:scale-[0.99] shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F5D90A] group-hover:bg-[#F5D90A] group-hover:text-black transition-colors shrink-0">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs uppercase font-mono tracking-wider text-zinc-400 block">
                  Behind The Scenes
                </span>
                <span className="text-sm font-medium text-white">
                  Instagram
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-[#F5D90A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
          </a>
        </div>

        {/* Footer Sub-bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-5 text-xs font-mono text-zinc-500">
          {/* Brand Signature Mark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#F5D90A]/40 ring-1 ring-white/10 shrink-0 relative bg-black shadow-[0_0_12px_rgba(245,217,10,0.25)]">
              <Image
                src="/images/aml_logo.svg"
                alt="AML Signature Mark"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold tracking-wider text-xs uppercase">AML.IN</span>
                <span className="text-[10px] text-zinc-500 font-mono">&copy; 2025</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">
                AI Commercial Director &bull; All Rights Reserved
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5 sm:gap-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-[#F5D90A] transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Studio CMS</span>
            </Link>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
