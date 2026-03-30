"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import AdBanner from "@/components/AdBanner";
import CountdownTimer from "@/components/CountdownTimer";

const TWENTY_FOUR_HOURS_MS = 24 * 3600000;

export default function SecondChancePage() {
  const router = useRouter();
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
      {/* Heading */}
      <div className="flex flex-col items-center mb-5 text-center">
        <Gift size={40} className="text-indigo-500 mb-2" />
        <h1 className="text-xl font-bold mb-1">You have a second chance!</h1>
        <p className="text-sm text-gray-500 max-w-xs">
          The original winner did not proceed. This item is now being offered to
          you.
        </p>
      </div>

      {/* Item card */}
      <div className="rounded-2xl bg-white p-5 shadow-sm mb-5">
        <div className="w-full aspect-[4/3] rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4" />

        <h2 className="font-bold text-lg mb-1">Vintage Mechanical Keyboard</h2>
        <p className="text-2xl font-bold text-indigo-600 mb-3">$110.00</p>

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
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mb-4">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full rounded-xl bg-[#10b981] py-3 text-white font-semibold text-base"
        >
          Continue with Deal
        </button>
        <button
          type="button"
          onClick={() => router.push("/listings")}
          className="w-full rounded-xl border border-gray-300 py-3 text-gray-600 font-semibold text-base"
        >
          Pass
        </button>
      </div>

      <p className="text-sm text-gray-500 italic text-center mb-6">
        Passing as a second-chance bidder has no penalties.
      </p>

      <AdBanner />
    </div>
  );
}
