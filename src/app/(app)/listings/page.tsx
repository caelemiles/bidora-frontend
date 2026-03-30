"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, PackageSearch } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import CountdownTimer from "@/components/CountdownTimer";
import Skeleton from "@/components/Skeleton";

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
  gradient: string;
  currentBid: number;
  startingBid: number;
  endsAt: number;
  category: string;
  status: "active";
  isHot: boolean;
}

const MOCK_LISTINGS: Listing[] = [
  {
    id: "1",
    title: "MacBook Pro 16″ M3 Max",
    gradient: "from-indigo-500 to-purple-600",
    currentBid: 2450,
    startingBid: 1800,
    endsAt: Date.now() + 2 * 3600000,
    category: "Electronics",
    status: "active",
    isHot: true,
  },
  {
    id: "2",
    title: "Vintage Leather Jacket",
    gradient: "from-amber-400 to-orange-500",
    currentBid: 320,
    startingBid: 150,
    endsAt: Date.now() + 5 * 3600000,
    category: "Fashion",
    status: "active",
    isHot: false,
  },
  {
    id: "3",
    title: "Mid-Century Modern Lamp",
    gradient: "from-purple-400 to-indigo-500",
    currentBid: 185,
    startingBid: 80,
    endsAt: Date.now() + 12 * 3600000,
    category: "Home & Garden",
    status: "active",
    isHot: false,
  },
  {
    id: "4",
    title: "Signed Basketball Jersey",
    gradient: "from-indigo-600 to-blue-500",
    currentBid: 890,
    startingBid: 500,
    endsAt: Date.now() + 1 * 3600000,
    category: "Sports",
    status: "active",
    isHot: true,
  },
  {
    id: "5",
    title: "1st Edition Pokémon Card",
    gradient: "from-amber-500 to-yellow-400",
    currentBid: 4200,
    startingBid: 3000,
    endsAt: Date.now() + 8 * 3600000,
    category: "Collectibles",
    status: "active",
    isHot: true,
  },
  {
    id: "6",
    title: "Rare Philosophy Textbook",
    gradient: "from-purple-500 to-pink-500",
    currentBid: 75,
    startingBid: 30,
    endsAt: Date.now() + 24 * 3600000,
    category: "Books",
    status: "active",
    isHot: false,
  },
  {
    id: "7",
    title: "LEGO Star Wars UCS Set",
    gradient: "from-indigo-400 to-purple-400",
    currentBid: 560,
    startingBid: 350,
    endsAt: Date.now() + 6 * 3600000,
    category: "Toys",
    status: "active",
    isHot: false,
  },
  {
    id: "8",
    title: "Abstract Oil Painting 24×36",
    gradient: "from-amber-600 to-purple-500",
    currentBid: 1100,
    startingBid: 700,
    endsAt: Date.now() + 18 * 3600000,
    category: "Art",
    status: "active",
    isHot: true,
  },
];

function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block rounded-2xl bg-white shadow-sm overflow-hidden"
    >
      {/* Image placeholder */}
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${listing.gradient}`}>
        {listing.isHot && (
          <span className="absolute top-2 left-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            Hot
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-2.5 space-y-1">
        <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
        <p className="text-indigo-600 font-bold text-sm">
          ${listing.currentBid.toLocaleString()}
        </p>
        <CountdownTimer endsAt={listing.endsAt} className="text-xs" />
        <p className="text-xs text-gray-400">{listing.category}</p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-2.5 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export default function ListingsPage() {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<SortValue>("newest");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    let items = MOCK_LISTINGS.filter((l) => {
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
        items = [...items].sort((a, b) => a.endsAt - b.endsAt);
        break;
      default:
        break;
    }

    return items;
  }, [search, category, sort]);

  // Interleave AdBanners after every 4 cards
  function renderGrid() {
    const elements: React.ReactNode[] = [];
    for (let i = 0; i < filtered.length; i++) {
      elements.push(<ListingCard key={filtered[i].id} listing={filtered[i]} />);

      if ((i + 1) % 4 === 0 && i + 1 < filtered.length) {
        elements.push(
          <div key={`ad-${i}`} className="col-span-full">
            <AdBanner />
          </div>
        );
      }
    }
    return elements;
  }

  return (
    <div className="px-4 pt-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Marketplace</h1>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Search"
          onClick={() => {
            const input = document.getElementById("listing-search");
            input?.focus();
          }}
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
          id="listing-search"
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
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <PackageSearch size={48} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No listings found</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {renderGrid()}
        </div>
      )}

      {/* Bottom AdBanner */}
      <div className="mt-6 mb-4">
        <AdBanner />
      </div>
    </div>
  );
}
