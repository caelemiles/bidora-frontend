"use client";

export default function AdBanner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full flex items-center justify-center bg-gray-100 border border-dashed border-gray-300 rounded-xl py-3 text-xs text-gray-400 select-none ${className}`}
    >
      <span>Ad &bull; Google AdMob Test</span>
    </div>
  );
}
