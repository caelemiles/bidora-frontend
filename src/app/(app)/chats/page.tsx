"use client";

import { useState } from "react";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";

const MOCK_CHATS = [
  {
    id: "1",
    type: "inquiry" as const,
    listingTitle: "Vintage Mechanical Keyboard",
    listingImage: null,
    otherUser: "RetroTech",
    lastMessage: "Is this still available?",
    timestamp: "2m ago",
    unread: true,
  },
  {
    id: "2",
    type: "inquiry" as const,
    listingTitle: "Limited Edition Sneakers",
    listingImage: null,
    otherUser: "SneakerHead",
    lastMessage: "Can you do a meetup at Orchard?",
    timestamp: "1h ago",
    unread: false,
  },
  {
    id: "3",
    type: "transaction" as const,
    listingTitle: "Antique Desk Lamp",
    listingImage: null,
    otherUser: "VintageFinder",
    lastMessage: "Great! Let's meet at the MRT station",
    timestamp: "3h ago",
    unread: true,
  },
  {
    id: "4",
    type: "transaction" as const,
    listingTitle: "Rare Comic Book Collection",
    listingImage: null,
    otherUser: "ComicFan42",
    lastMessage: "Payment sent via PayNow",
    timestamp: "1d ago",
    unread: false,
  },
];

type Tab = "inquiry" | "transaction";

export default function ChatsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("inquiry");

  const filteredChats = MOCK_CHATS.filter((chat) => chat.type === activeTab);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold">Chats</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {([
          { key: "inquiry", label: "Inquiries" },
          { key: "transaction", label: "Transactions" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === tab.key
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chat list */}
      <div>
        {filteredChats.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No chats yet
          </div>
        ) : (
          filteredChats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/${chat.id}`}
              className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 active:bg-gray-50 transition-colors"
            >
              {/* Listing image placeholder */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0" />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">
                  {chat.listingTitle}
                </p>
                <p className="text-xs text-gray-400">{chat.otherUser}</p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {chat.lastMessage}
                </p>
              </div>

              {/* Timestamp & unread */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-gray-400">{chat.timestamp}</span>
                {chat.unread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="px-4 py-4">
        <AdBanner />
      </div>
    </div>
  );
}
