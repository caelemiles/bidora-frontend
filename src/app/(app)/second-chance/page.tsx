"use client";

import { Gift } from "lucide-react";
import Link from "next/link";

export default function SecondChancePage() {
  // No mock data — real second-chance offers will come from API/Supabase
  return (
    <div className="px-4 pt-6 pb-6 max-w-2xl mx-auto">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <Gift size={32} className="text-indigo-400" />
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-1">
          Second Chance Offers
        </h1>
        <p className="text-gray-400 text-sm max-w-[240px]">
          If a winner passes on an auction, the next highest bidder may receive a
          second chance offer here.
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
