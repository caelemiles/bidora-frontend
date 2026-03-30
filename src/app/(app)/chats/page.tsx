"use client";

import { useState } from "react";
import { MessageCircle, Search, Inbox } from "lucide-react";

type ChatType = "inquiries" | "deals";
type ChatStatus = "active" | "archived" | "expired";

function EmptyState({ type, status }: { type: ChatType; status: ChatStatus }) {
  const labels: Record<ChatStatus, string> = {
    active: "No active chats",
    archived: "No archived chats",
    expired: "No expired chats",
  };

  const descriptions: Record<ChatStatus, string> = {
    active:
      type === "inquiries"
        ? "When you send or receive an inquiry about a listing, it will appear here."
        : "When you win an auction and start a deal, it will appear here.",
    archived: "Chats you archive will be saved here for your records.",
    expired: "Deleted chats will appear here temporarily.",
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        {status === "active" ? (
          <MessageCircle size={24} className="text-gray-300" />
        ) : (
          <Inbox size={24} className="text-gray-300" />
        )}
      </div>
      <p className="text-gray-500 font-medium text-sm">{labels[status]}</p>
      <p className="text-gray-400 text-xs mt-1 max-w-[240px]">
        {descriptions[status]}
      </p>
    </div>
  );
}

export default function ChatsPage() {
  const [activeType, setActiveType] = useState<ChatType>("inquiries");
  const [activeStatus, setActiveStatus] = useState<ChatStatus>("active");

  const typeButtons: { key: ChatType; label: string }[] = [
    { key: "inquiries", label: "Inquiries" },
    { key: "deals", label: "Deals" },
  ];

  const statusButtons: { key: ChatStatus; label: string }[] = [
    { key: "active", label: "Active" },
    { key: "archived", label: "Archived" },
    { key: "expired", label: "Expired" },
  ];

  return (
    <div className="max-w-2xl mx-auto lg:max-w-5xl">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 lg:px-10 lg:pt-10">
        <h1 className="text-xl font-bold tracking-tight lg:text-2xl">Chats</h1>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search chats..."
            className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* Type Tabs */}
      <div className="flex border-b border-gray-200">
        {typeButtons.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveType(tab.key);
              setActiveStatus("active");
            }}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeType === tab.key
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Chips */}
      <div className="flex gap-2 px-4 py-3">
        {statusButtons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActiveStatus(btn.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeStatus === btn.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Chat list — empty since all mock data is removed */}
      <EmptyState type={activeType} status={activeStatus} />
    </div>
  );
}
