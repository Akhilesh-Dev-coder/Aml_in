"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] ambient-yellow-aura rounded-full blur-3xl opacity-30 pointer-events-none" />

      {/* Top Bar */}
      <div className="flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#F5D90A]" />
          <span>Return to Portfolio</span>
        </Link>

        <span className="text-xs font-mono text-zinc-600">
          STUDIO CMS // SECURE GATEWAY
        </span>
      </div>

      {/* Login Box */}
      <div className="w-full max-w-md mx-auto my-auto relative z-10">
        <div className="bg-[#111111] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.9)]">
          
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#F5D90A]/50 bg-black shadow-[0_0_20px_rgba(245,217,10,0.25)] shrink-0">
              <Image
                src="/images/aml_logo.svg"
                alt="AML Logo"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-xl font-medium text-white tracking-tight">
                Director Access
              </h1>
              <p className="text-xs text-zinc-400 font-mono">
                AML.IN Studio Administration
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 mb-6">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Administrator Email / Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@aml.in"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-mono tracking-wider text-zinc-400 mb-2">
                Secure Key / Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#171717] border border-white/10 focus:border-[#F5D90A] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#F5D90A] hover:bg-[#e5ca09] text-black font-semibold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,217,10,0.25)] cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>Access Studio CMS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/[0.08] text-center">
            <p className="text-[11px] font-mono text-zinc-500">
              Default credentials in dev: <span className="text-zinc-300">admin@aml.in</span> / <span className="text-zinc-300">admin@123</span>
            </p>
          </div>

        </div>
      </div>

      {/* Footer info */}
      <div className="text-center text-xs font-mono text-zinc-600 relative z-10">
        AML // AI COMMERCIAL DIRECTOR &bull; PROTECTED SUITE
      </div>
    </div>
  );
}
