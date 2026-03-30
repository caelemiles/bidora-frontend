"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, User, MessageCircle } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import AdBanner from "@/components/AdBanner";

const MOCK_LISTING = {
  id: "1",
  title: "Vintage Mechanical Keyboard",
  description:
    "A beautifully restored vintage mechanical keyboard from the 1990s. Cherry MX Blue switches, full ANSI layout. Perfect for collectors and enthusiasts who appreciate the tactile feel of classic hardware. Comes with original keycaps and a custom USB adapter.",
  currentBid: 85,
  startingBid: 50,
  endsAt: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
  category: "Electronics",
  condition: "Used - Like New",
  seller: { name: "RetroTech", avatar: null },
  images: 3,
  isOwner: false,
};

const IMAGE_GRADIENTS = [
  "from-indigo-400 to-purple-500",
  "from-emerald-400 to-cyan-500",
  "from-amber-400 to-orange-500",
];

export default function ListingDetailPage() {
  const listing = MOCK_LISTING;

  const [currentImage, setCurrentImage] = useState(0);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState(listing.currentBid + 1);
  const [bidSuccess, setBidSuccess] = useState(false);

  function handleImageTap(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) {
      setCurrentImage((prev) => (prev > 0 ? prev - 1 : listing.images - 1));
    } else {
      setCurrentImage((prev) => (prev < listing.images - 1 ? prev + 1 : 0));
    }
  }

  function handleConfirmBid() {
    setBidSuccess(true);
    setTimeout(() => {
      setBidSuccess(false);
      setShowBidModal(false);
      setBidAmount(listing.currentBid + 1);
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2">
        <Link
          href="/listings"
          className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      {/* Image Carousel */}
      <div
        className="relative w-full aspect-[4/3] rounded-b-2xl overflow-hidden cursor-pointer"
        onClick={handleImageTap}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-br ${IMAGE_GRADIENTS[currentImage]} flex items-center justify-center`}
        >
          <span className="text-white/60 text-lg font-medium">
            Image {currentImage + 1} of {listing.images}
          </span>
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {Array.from({ length: listing.images }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentImage ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Title & Price */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-gray-900">{listing.title}</h1>
        <p className="mt-1 text-lg font-bold text-indigo-600">
          Current Bid: ${listing.currentBid}
        </p>
        <p className="text-sm text-gray-400">
          Starting bid: ${listing.startingBid}
        </p>
      </div>

      {/* Timer */}
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <Clock className="h-5 w-5 text-indigo-500 shrink-0" />
        <div>
          <p className="text-xs text-gray-500">Auction ends in</p>
          <CountdownTimer endsAt={listing.endsAt} className="text-gray-900" />
        </div>
      </div>

      {/* Seller info */}
      <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
          <User className="h-5 w-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {listing.seller.name}
          </p>
          <button className="text-xs text-indigo-600 hover:underline">
            View Profile
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex justify-between border-b border-gray-100 pb-3">
          <span className="text-sm text-gray-500">Condition</span>
          <span className="text-sm font-medium text-gray-900">
            {listing.condition}
          </span>
        </div>
        <div className="flex justify-between border-b border-gray-100 py-3">
          <span className="text-sm text-gray-500">Category</span>
          <span className="text-sm font-medium text-gray-900">
            {listing.category}
          </span>
        </div>
        <div className="pt-3">
          <p className="text-sm text-gray-500 mb-1">Description</p>
          <p className="text-sm leading-relaxed text-gray-700">
            {listing.description}
          </p>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="mx-4 mt-4">
        <AdBanner />
      </div>

      {/* Sticky Action Buttons */}
      <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {listing.isOwner ? (
          <div className="flex items-center justify-center rounded-xl bg-gray-100 py-3">
            <span className="text-sm font-medium text-gray-500">
              Your Listing
            </span>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setShowBidModal(true)}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white active:bg-indigo-700 transition-colors"
            >
              Place Bid
            </button>
            <Link
              href={`/chats/inquiry/${listing.id}`}
              className="flex items-center justify-center gap-1.5 flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 active:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Send Inquiry
            </Link>
          </div>
        )}
      </div>

      {/* Bid Modal */}
      {showBidModal && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBidModal(false);
          }}
        >
          <div className="w-full rounded-t-2xl bg-white p-6 animate-in slide-in-from-bottom">
            {bidSuccess ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <span className="text-2xl">✓</span>
                </div>
                <p className="text-lg font-bold text-gray-900">Bid Placed!</p>
                <p className="text-sm text-gray-500">
                  Your bid of ${bidAmount} has been submitted.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900">
                  Place a Bid
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Current bid:{" "}
                  <span className="font-semibold text-indigo-600">
                    ${listing.currentBid}
                  </span>
                </p>

                <div className="mt-4">
                  <label
                    htmlFor="bid-amount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your bid ($)
                  </label>
                  <input
                    id="bid-amount"
                    type="number"
                    min={listing.currentBid + 1}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-lg font-semibold text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-colors"
                  />
                </div>

                <button
                  onClick={handleConfirmBid}
                  disabled={bidAmount <= listing.currentBid}
                  className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white disabled:opacity-50 active:bg-indigo-700 transition-colors"
                >
                  Confirm Bid
                </button>
                <button
                  onClick={() => setShowBidModal(false)}
                  className="mt-2 w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
