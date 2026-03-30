"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";

export default function WonPage() {
  // No mock data — real won auctions will be loaded from API/Supabase
  return (
    <div className="px-4 pt-6 pb-6 max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
          <Trophy size={32} className="text-amber-400" />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-1">Won Auctions</h1>
        <p className="text-gray-400 text-sm max-w-[240px]">
          When you win an auction, it will appear here for you to confirm.
        </p>
        <Link
          href="/listings"
          className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Browse Listings
        </Link>
      </div>
    </div>
  );
}
