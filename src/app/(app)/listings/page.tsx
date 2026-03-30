"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Search, PackageSearch } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import Skeleton from "@/components/Skeleton";
import { supabase } from "@/lib/supabase";

const CATEGORIES = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Collectibles",
  "Books",
  "Toys",
  "Vehicles",
  "Art",
  "Other",
] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "ending-soon", label: "Ending Soon" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface Listing {
  id: string;
  title: string;
  images: string[];
  currentBid: number;
  startingBid: number;
  endsAt: string;
  category: string;
  status: string;
}

function ListingCard({ listing }: { listing: Listing }) {
  const imageUrl = listing.images?.[0];

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block rounded-2xl bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500">
            <span className="text-2xl font-bold text-white/60">{listing.title[0]}</span>
          </div>
        )}
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
        <p className="text-indigo-600 font-bold text-sm">
          ${listing.currentBid.toLocaleString()}
        </p>
        <CountdownTimer endsAt={listing.endsAt} className="text-xs text-gray-500" />
        <p className="text-[11px] text-gray-400">{listing.category}</p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortValue>("newest");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        console.log("[Listings] Fetching listings from Supabase...");
        const { data, error } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("[Listings] Fetch error:", error);
          setListings([]);
        } else {
          console.log("[Listings] Fetched", data?.length ?? 0, "listings");
          const mapped: Listing[] = (data || []).map((row) => ({
            id: row.id,
            title: row.title,
            images: row.images || [],
            currentBid: row.current_bid || row.starting_bid,
            startingBid: row.starting_bid,
            endsAt: row.ends_at,
            category: row.category,
            status: row.status,
          }));
          setListings(mapped);
        }
      } catch (err) {
        console.error("[Listings] Unexpected error:", err);
        setListings([]);
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, []);

  const filtered = useMemo(() => {
    let items = listings.filter((l) => {
      const matchesSearch =
        !search || l.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || l.category === category;
      return matchesSearch && matchesCategory;
    });

    switch (sort) {
      case "price-asc":
        items = [...items].sort((a, b) => a.currentBid - b.currentBid);
        break;
      case "price-desc":
        items = [...items].sort((a, b) => b.currentBid - a.currentBid);
        break;
      case "ending-soon":
        items = [...items].sort(
          (a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime()
        );
        break;
      default:
        break;
    }

    return items;
  }, [listings, search, category, sort]);

  return (
    <div className="px-4 pt-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-xs text-gray-400 mt-0.5">Browse all active listings</p>
        </div>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Search"
          onClick={() => searchRef.current?.focus()}
        >
          <Search size={20} />
        </button>
      </div>

      {/* Search input */}
      <div className="relative mb-3">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              category === cat
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="mb-4">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortValue)}
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Listings grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <PackageSearch size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No listings yet</p>
          <p className="text-gray-400 text-sm mt-1 max-w-[240px]">
            When sellers create listings, they will appear here. Be the first to list something!
          </p>
          <Link
            href="/sell"
            className="mt-4 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            Create Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
