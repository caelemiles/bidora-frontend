import Link from "next/link";
import AdBanner from "@/components/AdBanner";

export default function WelcomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-between bg-white px-6 py-12 font-sans">
      {/* Top spacer */}
      <div />

      {/* Hero */}
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-2xl font-extrabold text-white shadow-lg">
            B
          </span>
          <span className="text-4xl font-extrabold tracking-tight text-gray-900">
            Bidora
          </span>
        </div>

        {/* Tagline */}
        <p className="text-lg font-medium text-gray-500">
          Buy. Sell. Bid. Win.
        </p>

        {/* CTA Buttons */}
        <div className="mt-4 flex w-full max-w-xs flex-col gap-3">
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
      </div>

      {/* Footer */}
      <div className="flex w-full max-w-xs flex-col items-center gap-4">
        <p className="text-xs font-medium text-gray-400">V0.1</p>
        <AdBanner />
      </div>
    </div>
  );
}
