"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Camera } from "lucide-react";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  return (
    <div className="px-4 pt-4 pb-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Back to settings"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <h1 className="text-xl font-bold tracking-tight">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
            <User size={40} className="text-indigo-400" />
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg"
          >
            <Camera size={14} />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl bg-white shadow-sm p-5 space-y-5">
        <div>
          <label
            htmlFor="displayName"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Display Name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about yourself..."
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {bio.length}/200
          </p>
        </div>
      </div>

      <button
        type="button"
        className="w-full mt-5 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
      >
        Save Changes
      </button>
    </div>
  );
}
