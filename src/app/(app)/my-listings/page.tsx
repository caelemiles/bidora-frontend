"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Plus } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import { supabase } from "@/lib/supabase";
import { auth } from "@/lib/firebase";

type ListingStatus = "active" | "awaiting_confirmation" | "awaiting_completion" | "completed";

interface MyListing {
  id: string;
  title: string;
  images: string[];
  currentBid: number;
  finalPrice?: number;
  endsAt: string;
  status: ListingStatus;
}

const TABS: { key: ListingStatus; label: string }[] = [
  { key: "active", label: "Active" },
  { key: "awaiting_confirmation", label: "Awaiting" },
  { key: "awaiting_completion", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const STATUS_BADGE: Record<ListingStatus, { text: string; className: string }> = {
  active: { text: "Active", className: "bg-emerald-100 text-emerald-700" },
  awaiting_confirmation: {
    text: "Awaiting Confirmation",
    className: "bg-amber-100 text-amber-700",
  },
  awaiting_completion: {
    text: "In Progress",
    className: "bg-blue-100 text-blue-700",
  },
  completed: { text: "Completed", className: "bg-gray-100 text-gray-600" },
};

function ListingCard({ listing }: { listing: MyListing }) {
  const badge = STATUS_BADGE[listing.status];
  const imageUrl = listing.images?.[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500">
            <span className="text-lg font-bold text-white/60">{listing.title[0]}</span>
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <h3 className="truncate text-sm font-medium">{listing.title}</h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
          >
            {badge.text}
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
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyListings() {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.log("[MyListings] No user logged in");
          setLoading(false);
          return;
        }

        // Look up Supabase user ID
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("firebase_uid", user.uid)
          .single();

        if (userError || !userData) {
          console.error("[MyListings] User lookup error:", userError);
          setLoading(false);
          return;
        }

        console.log("[MyListings] Fetching listings for user:", userData.id);

        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("seller_id", userData.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[MyListings] Fetch error:", error);
        } else {
          console.log("[MyListings] Fetched", data?.length ?? 0, "listings");
          const mapped: MyListing[] = (data || []).map((row) => ({
            id: row.id,
            title: row.title,
            images: row.images || [],
            currentBid: row.current_bid || row.starting_bid,
            endsAt: row.ends_at,
            status: row.status as ListingStatus,
          }));
          setListings(mapped);
        }
      } catch (err) {
        console.error("[MyListings] Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyListings();
  }, []);

  const filtered = listings.filter((l) => l.status === activeTab);

  return (
    <div className="px-4 pt-5 max-w-2xl mx-auto lg:max-w-4xl lg:px-8 lg:pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight lg:text-2xl">My Listings</h1>
          <p className="text-xs text-gray-400 mt-0.5 lg:text-sm">Your created listings</p>
        </div>
        <Link
          href="/sell"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 transition-colors"
          aria-label="Create listing"
        >
          <Plus size={18} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listing cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-gray-400 text-sm">Loading your listings…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <Package size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No listings here yet</p>
          <p className="text-gray-400 text-sm mt-1 max-w-[240px]">
            Create your first listing and start selling on Bidora.
          </p>
          <Link
            href="/sell"
            className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
