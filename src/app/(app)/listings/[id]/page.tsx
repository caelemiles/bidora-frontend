"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Clock, MessageCircle } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import Skeleton from "@/components/Skeleton";
import { supabase } from "@/lib/supabase";

interface ListingDetail {
  id: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  condition: string;
  startingBid: number;
  currentBid: number;
  buyNowPrice: number | null;
  endsAt: string;
  status: string;
}

export default function ListingDetailPage() {
  const params = useParams();
  const listingId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<ListingDetail | null>(null);

  useEffect(() => {
    async function fetchListing() {
      try {
        console.log("[ListingDetail] Fetching listing:", listingId);
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("id", listingId)
          .single();

        if (error) {
          console.error("[ListingDetail] Fetch error:", error);
          setListing(null);
        } else if (data) {
          setListing({
            id: data.id,
            title: data.title,
            description: data.description || "",
            images: data.images || [],
            category: data.category,
            condition: data.condition,
            startingBid: data.starting_bid,
            currentBid: data.current_bid || data.starting_bid,
            buyNowPrice: data.buy_now_price,
            endsAt: data.ends_at,
            status: data.status,
          });
        }
      } catch (err) {
        console.error("[ListingDetail] Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
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

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/listings"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
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
      </div>
    );
  }

  const imageUrl = listing.images?.[0];

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

      {/* Listing image */}
      <div className="aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500">
            <span className="text-4xl font-bold text-white/60">{listing.title[0]}</span>
          </div>
        )}
      </div>

      {/* Multiple images thumbnails */}
      {listing.images.length > 1 && (
        <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-none">
          {listing.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${listing.title} ${i + 1}`}
              className="h-16 w-16 shrink-0 rounded-lg object-cover border-2 border-transparent"
            />
          ))}
        </div>
      )}

      {/* Details */}
      <div className="px-4 pt-4 space-y-4 max-w-2xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
          <p className="text-xs text-gray-400 mt-1">{listing.category} · {listing.condition}</p>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-gray-400">Current Bid</p>
            <p className="text-xl font-bold text-indigo-600">
              ${listing.currentBid.toLocaleString()}
            </p>
          </div>
          {listing.buyNowPrice && (
            <div>
              <p className="text-xs text-gray-400">Buy Now</p>
              <p className="text-lg font-bold text-emerald-600">
                ${listing.buyNowPrice.toLocaleString()}
              </p>
            </div>
          )}
          <div className="ml-auto">
            <p className="text-xs text-gray-400">Time Left</p>
            <CountdownTimer endsAt={listing.endsAt} className="text-sm" />
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-sm text-gray-900 mb-2">Description</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{listing.description}</p>
        </div>
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-3 max-w-2xl mx-auto">
          <button
            className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
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
