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
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 font-sans lg:px-8">
      {/* Desktop: constrained centered panel */}
      <div className="flex w-full max-w-sm flex-col items-center gap-10 lg:max-w-md lg:gap-14">
        {/* Hero */}
        <div className="flex flex-col items-center gap-4 text-center lg:gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl font-extrabold text-white shadow-lg lg:h-20 lg:w-20 lg:rounded-3xl lg:text-4xl lg:shadow-xl">
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
        </div>

        {/* CTA Buttons */}
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:gap-4">
          <Link
            href="/signup"
            className="flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--primary)] px-8 text-base font-semibold leading-none text-white shadow-md transition-opacity hover:opacity-90 active:scale-[0.98] lg:h-[60px] lg:text-lg"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="flex h-14 w-full items-center justify-center rounded-2xl border-2 border-[var(--primary)] px-8 text-base font-semibold leading-none text-[var(--primary)] transition-colors hover:bg-[var(--primary-light)] active:scale-[0.98] lg:h-[60px] lg:text-lg"
          >
            Log In
          </Link>
        </div>

        {/* PWA Install Prompt */}
        {deferredPrompt && (
          <button
            type="button"
            onClick={handleInstall}
            className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-[0.98]"
          >
            <Download size={16} />
            Install Bidora App
          </button>
        )}

        {/* Footer */}
        <p className="text-xs font-medium text-gray-300">v0.2</p>
      </div>
    </div>
  );
}
