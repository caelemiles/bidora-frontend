"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import type { BeforeInstallPromptEvent } from "@/types/pwa";

export default function WelcomePage() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between bg-white px-6 py-12 font-sans lg:justify-center lg:gap-12">
      {/* Top spacer (mobile only) */}
      <div className="lg:hidden" />

      {/* Hero */}
      <div className="flex flex-col items-center gap-6 text-center lg:gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl font-extrabold text-white shadow-lg lg:h-16 lg:w-16 lg:text-3xl">
            B
          </span>
          <span className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl">
            Bidora
          </span>
        </div>

        {/* Tagline */}
        <p className="text-lg font-medium text-gray-500 lg:text-xl">
          Buy. Sell. Bid. Win.
        </p>

        {/* CTA Buttons */}
        <div className="mt-4 flex w-full max-w-xs flex-col gap-3 lg:max-w-sm lg:flex-row lg:gap-4">
          <Link
            href="/signup"
            className="flex h-12 items-center justify-center rounded-xl bg-[var(--primary)] text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90 active:scale-[0.98]"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="flex h-12 items-center justify-center rounded-xl border-2 border-[var(--primary)] text-base font-semibold text-[var(--primary)] transition-colors hover:bg-[var(--primary-light)] active:scale-[0.98]"
          >
            Log In
          </Link>
        </div>

        {/* PWA Install Prompt */}
        {deferredPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="mt-2 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-[0.98]"
          >
            <Download size={16} />
            Install Bidora App
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex w-full max-w-xs flex-col items-center gap-4">
        <p className="text-xs font-medium text-gray-300">v0.2</p>
      </div>
    </div>
  );
}
