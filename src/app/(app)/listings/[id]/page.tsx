"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, User, MessageCircle } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import Skeleton from "@/components/Skeleton";

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch listing from API/Supabase by listingId
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
        <Skeleton className="w-full aspect-[4/3] rounded-b-2xl" />
        <div className="px-4 pt-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Empty state — no listing data loaded yet
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Placeholder for listing content */}
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <Clock size={32} className="text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Listing not found</p>
        <p className="text-gray-400 text-sm mt-1 max-w-[240px]">
          This listing may have been removed or doesn&apos;t exist yet.
        </p>
        <Link
          href="/listings"
          className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Browse Listings
        </Link>
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            disabled
            className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white opacity-50 cursor-not-allowed"
          >
            Place Bid
          </button>
          <Link
            href={`/chats/inquiry/${listingId}`}
            className="flex items-center justify-center gap-1.5 flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 active:bg-gray-50 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Send Inquiry
          </Link>
        </div>
      </div>
    </div>
  );
}
