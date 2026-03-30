"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import CountdownTimer from "@/components/CountdownTimer";

const TWENTY_FOUR_HOURS_MS = 24 * 3600000;

export default function WonPage() {
  const router = useRouter();
  const [showPassModal, setShowPassModal] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const endsAt = Date.now() + TWENTY_FOUR_HOURS_MS;

  function handleContinue() {
    setConfirmed(true);
    setTimeout(() => router.push("/chats/3"), 1500);
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
        <div className="text-4xl mb-3">✅</div>
        <h2 className="text-xl font-bold mb-1">Deal confirmed!</h2>
        <p className="text-gray-500 text-sm">Opening chat...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-6 max-w-2xl mx-auto">
      {/* Celebratory heading */}
      <div className="flex flex-col items-center mb-5">
        <Trophy size={40} className="text-amber-500 mb-2" />
        <h1 className="text-xl font-bold">🎉 You won this auction!</h1>
      </div>

      {/* Item card */}
      <div className="rounded-2xl bg-white p-5 shadow-sm mb-5">
        {/* Image placeholder */}
        <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4" />

        <h2 className="font-bold text-lg mb-1">Vintage Mechanical Keyboard</h2>
        <p className="text-2xl font-bold text-indigo-600 mb-3">$125.00</p>

        {/* Seller */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-7 w-7 rounded-full bg-gray-200" />
          <span className="text-sm text-gray-600">RetroTech</span>
        </div>

        <hr className="border-gray-100 mb-4" />

        {/* Countdown */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">Time to confirm</span>
          <CountdownTimer endsAt={endsAt} />
        </div>
        <p className="text-sm text-gray-500">
          You have 24 hours to confirm whether you want to continue with this
          deal.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mb-6">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full rounded-xl bg-[#10b981] py-3 text-white font-semibold text-base"
        >
          Continue with Deal
        </button>
        <button
          type="button"
          onClick={() => setShowPassModal(true)}
          className="w-full rounded-xl border border-red-300 py-3 text-red-500 font-semibold text-base"
        >
          Pass
        </button>
      </div>

      <AdBanner />

      {/* Pass warning modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold mb-3">Are you sure?</h3>

            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-5">
              <p className="text-sm text-amber-700">
                Repeatedly passing on won auctions may result in temporary
                restrictions on your account.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => router.push("/listings")}
                className="w-full rounded-xl bg-red-500 py-3 text-white font-semibold text-base"
              >
                Yes, Pass
              </button>
              <button
                type="button"
                onClick={() => setShowPassModal(false)}
                className="w-full rounded-xl bg-gray-100 py-3 text-gray-600 font-semibold text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
