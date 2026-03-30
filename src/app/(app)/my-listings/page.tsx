"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import CountdownTimer from "@/components/CountdownTimer";

type ListingStatus = "active" | "awaiting_confirmation" | "awaiting_completion" | "completed";

interface MyListing {
  id: string;
  title: string;
  gradient: string;
  currentBid: number;
  finalPrice?: number;
  endsAt: number;
  status: ListingStatus;
}

const TABS: { key: ListingStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "awaiting_confirmation", label: "Awaiting Confirmation" },
  { key: "awaiting_completion", label: "Awaiting Completion" },
  { key: "completed", label: "Completed" },
];

const STATUS_BADGE: Record<ListingStatus, { text: string; className: string }> = {
  active: { text: "Active", className: "bg-emerald-100 text-emerald-700" },
  awaiting_confirmation: {
    text: "Awaiting Confirmation",
    className: "bg-amber-100 text-amber-700",
  },
  awaiting_completion: {
    text: "Awaiting Completion",
    className: "bg-blue-100 text-blue-700",
  },
  completed: { text: "Completed", className: "bg-gray-100 text-gray-600" },
};

const MOCK_LISTING_DATA = [
  { id: "101", title: "MacBook Pro 16″ M3 Max", gradient: "from-indigo-500 to-purple-600", currentBid: 2450, hoursLeft: 2, status: "active" as ListingStatus },
  { id: "102", title: "Vintage Leather Jacket", gradient: "from-amber-400 to-orange-500", currentBid: 320, hoursLeft: 5, status: "active" as ListingStatus },
  { id: "103", title: "Mid-Century Modern Lamp", gradient: "from-purple-400 to-indigo-500", currentBid: 185, hoursLeft: -0.001, status: "awaiting_confirmation" as ListingStatus },
  { id: "104", title: "Signed Basketball Jersey", gradient: "from-indigo-600 to-blue-500", currentBid: 890, hoursLeft: -0.001, status: "awaiting_completion" as ListingStatus },
  { id: "105", title: "1st Edition Pokémon Card", gradient: "from-amber-500 to-yellow-400", currentBid: 4200, finalPrice: 4200, hoursLeft: -24, status: "completed" as ListingStatus },
  { id: "106", title: "Rare Philosophy Textbook", gradient: "from-purple-500 to-pink-500", currentBid: 75, finalPrice: 75, hoursLeft: -48, status: "completed" as ListingStatus },
];

function ListingCard({ listing }: { listing: MyListing }) {
  const badge = STATUS_BADGE[listing.status];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm"
    >
      {/* Thumbnail */}
      <div
        className={`h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br ${listing.gradient}`}
      />

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{listing.title}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
          >
            {badge.text}
          </span>
          <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
            Your Listing
          </span>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-indigo-600">
            ${(listing.finalPrice ?? listing.currentBid).toLocaleString()}
          </p>
          {listing.status === "active" && (
            <CountdownTimer endsAt={listing.endsAt} className="text-xs" />
          )}
        </div>
      </div>
    </Link>
  );
}

export default function MyListingsPage() {
  const [activeTab, setActiveTab] = useState<ListingStatus>("active");

  const listings = useMemo(() => {
    const now = Date.now();
    return MOCK_LISTING_DATA.map((d) => ({
      id: d.id,
      title: d.title,
      gradient: d.gradient,
      currentBid: d.currentBid,
      finalPrice: (d as { finalPrice?: number }).finalPrice,
      endsAt: now + d.hoursLeft * 3600000,
      status: d.status,
    }));
  }, []);

  const filtered = listings.filter((l) => l.status === activeTab);

  return (
    <div className="px-4 pt-4 max-w-2xl mx-auto">
      {/* Header */}
      <h1 className="text-xl font-bold mb-4">My Listings</h1>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 border-b-2 px-3 pb-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listing cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No listings here yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Ad */}
      <div className="mt-6 mb-4">
        <AdBanner />
      </div>
    </div>
  );
}
